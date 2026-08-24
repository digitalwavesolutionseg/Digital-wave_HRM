import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Role } from "../../common/decorators/roles.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { AuditService } from "../audit/audit.service";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";

const INVITE_TTL_DAYS = 7;

@Injectable()
export class UsersService {
  private resendInvite: Resend | null;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {
    const inviteKey = process.env.RESEND_INVITE_API_KEY ?? process.env.RESEND_API_KEY;
    this.resendInvite = inviteKey ? new Resend(inviteKey) : null;
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        employee: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto, actor?: any) {
    const target = await this.findOne(id);
    if (!target) throw new NotFoundException("User not found");

    if (dto.role && dto.role !== target.role) {
      if (!actor || actor.role !== Role.SUPER_ADMIN) {
        throw new ForbiddenException("Only a SUPER_ADMIN can change a user's role");
      }
      if (id === actor.id) {
        throw new ForbiddenException("You cannot change your own role");
      }
    }

    const data: Partial<UpdateUserDto> = { ...dto };
    if (data.role === undefined) delete data.role;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
      },
    });

    await this.auditService.record({
      actorId: actor?.id,
      action: "users.update",
      entity: "user",
      entityId: id,
      metadata: { changed: dto },
    });

    return updated;
  }

  async invite(actor: any, dto: InviteUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("A user with this email already exists");

    const role = (dto.role ?? Role.EMPLOYEE) as Role;
    if (role === Role.SUPER_ADMIN && actor?.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException("Only a SUPER_ADMIN can invite another SUPER_ADMIN");
    }

    const unusablePassword = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
    const inviteToken = randomBytes(24).toString("hex");
    const inviteTokenHash = createHash("sha256").update(inviteToken).digest("hex");

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role,
        password: unusablePassword,
        inviteTokenHash,
        inviteExpires: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    const appUrl =
      process.env.APP_URL ??
      process.env.CORS_ORIGIN?.split(",")[0]?.trim() ??
      "https://hrm.digital-wave.solutions";
    const link = `${appUrl}/accept-invite?token=${inviteToken}`;

    let sent = false;
    if (this.resendInvite) {
      try {
        const from = process.env.RESEND_FROM_EMAIL ?? "Digital Wave HRM <onboarding@resend.dev>";
        await this.resendInvite.emails.send({
          from,
          to: dto.email,
          subject: "You're invited to Digital Wave HRM",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;color:#0f172a">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                <div style="width:36px;height:36px;border-radius:10px;background:#0b5fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">DW</div>
                <span style="font-weight:700;font-size:18px">Digital Wave HRM</span>
              </div>
              <h2 style="margin:0 0 8px;font-size:20px">Hi ${dto.firstName},</h2>
              <p style="margin:0 0 16px;color:#475569;line-height:1.6">You have been invited to join Digital Wave HRM as <strong>${role.replaceAll("_", " ").toLowerCase()}</strong>. Click the button below to set your password and activate your account. The link expires in ${INVITE_TTL_DAYS} days.</p>
              <a href="${link}" style="display:inline-block;background:#0b5fff;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px">Accept invitation</a>
              <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;word-break:break-all">If the button doesn't work, copy this link: ${link}</p>
            </div>
          `,
        });
        sent = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown";
        console.error(`Invite email send failed: ${message.slice(0, 200)}`);
      }
    }

    await this.auditService.record({
      actorId: actor?.id,
      action: "users.invited",
      entity: "user",
      entityId: user.id,
      metadata: { email: dto.email, role, emailed: sent },
    });

    return {
      success: true,
      emailed: sent,
      ...(process.env.NODE_ENV !== "production" ? { devInviteLink: link } : {}),
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
