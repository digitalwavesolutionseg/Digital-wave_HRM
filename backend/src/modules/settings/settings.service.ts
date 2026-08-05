import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.companySetting.findMany();
    const settings: Record<string, any> = {};
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    return settings;
  }

  async findOne(key: string) {
    const row = await this.prisma.companySetting.findUnique({ where: { key } });
    return row ? row.value : null;
  }

  async upsert(body: Record<string, any>) {
    const updated: string[] = [];
    for (const [key, value] of Object.entries(body)) {
      await this.prisma.companySetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      updated.push(key);
    }
    return { updated };
  }

  async set(key: string, value: any) {
    return this.prisma.companySetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async remove(key: string) {
    await this.prisma.companySetting.delete({ where: { key } }).catch(() => undefined);
    return { success: true };
  }
}