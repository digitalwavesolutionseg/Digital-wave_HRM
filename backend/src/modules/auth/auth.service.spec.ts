import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";

const HASHED = bcrypt.hashSync("CorrectPass1!", 4);

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "user-1",
    email: "admin@test.com",
    password: HASHED,
    firstName: "Admin",
    lastName: "User",
    role: "SUPER_ADMIN",
    isActive: true,
    emailVerifiedAt: new Date(),
    refreshToken: null,
    failedLoginAttempts: 0,
    lockoutUntil: null,
    ...overrides,
  };
}

function makeService() {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  const jwtService = { signAsync: jest.fn().mockResolvedValue("jwt-token") };
  const auditService = { record: jest.fn().mockResolvedValue({}) };
  const service = new AuthService(prisma as never, jwtService as never, auditService as never);
  return { service, prisma, jwtService, auditService };
}

describe("AuthService.login lockout", () => {
  it("rejects unknown emails without touching the database", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login({ email: "no@user.com", password: "x" })).rejects.toThrow(
      new UnauthorizedException("Invalid credentials")
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects login while the account is locked", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(
      makeUser({ lockoutUntil: new Date(Date.now() + 10 * 60 * 1000) })
    );
    await expect(
      service.login({ email: "admin@test.com", password: "CorrectPass1!" })
    ).rejects.toThrow("temporarily locked");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("increments failed attempts on a wrong password", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(makeUser({ failedLoginAttempts: 2 }));
    await expect(
      service.login({ email: "admin@test.com", password: "WrongPass1!" })
    ).rejects.toThrow("Invalid credentials");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { failedLoginAttempts: 3 },
    });
  });

  it("locks the account after 5 failed attempts", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(makeUser({ failedLoginAttempts: 4 }));
    await expect(
      service.login({ email: "admin@test.com", password: "WrongPass1!" })
    ).rejects.toThrow("Invalid credentials");
    const call = prisma.user.update.mock.calls[0][0];
    expect(call.data.failedLoginAttempts).toBe(5);
    expect(call.data.lockoutUntil).toBeInstanceOf(Date);
  });

  it("resets attempts and returns tokens on success", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(makeUser({ failedLoginAttempts: 3 }));
    const result = await service.login({ email: "admin@test.com", password: "CorrectPass1!" });
    expect(result.accessToken).toBe("jwt-token");
    expect(result.user.email).toBe("admin@test.com");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { failedLoginAttempts: 0, lockoutUntil: null },
    });
  });

  it("rejects disabled accounts even with correct credentials", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false }));
    await expect(
      service.login({ email: "admin@test.com", password: "CorrectPass1!" })
    ).rejects.toThrow("Account is disabled");
  });
});

describe("AuthService.changePassword", () => {
  it("rejects an incorrect current password", async () => {
    const { service, prisma } = makeService();
    prisma.user.findUnique.mockResolvedValue(makeUser());
    await expect(
      service.changePassword("user-1", { currentPassword: "WrongPass1!", newPassword: "NewPass1!x" })
    ).rejects.toThrow(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("updates the password, revokes sessions and audits the change", async () => {
    const { service, prisma, auditService } = makeService();
    prisma.user.findUnique.mockResolvedValue(makeUser());
    prisma.user.update.mockResolvedValue({});
    const result = await service.changePassword("user-1", {
      currentPassword: "CorrectPass1!",
      newPassword: "NewPass1!x",
    });
    expect(result).toEqual({ success: true });
    const call = prisma.user.update.mock.calls[0][0];
    expect(call.data.refreshToken).toBeNull();
    expect(call.data.passwordChangedAt).toBeInstanceOf(Date);
    expect(await bcrypt.compare("NewPass1!x", call.data.password)).toBe(true);
    expect(auditService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.password.change", entityId: "user-1" })
    );
  });
});
