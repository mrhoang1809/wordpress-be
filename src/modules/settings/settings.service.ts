import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface UpdateSettingsDto {
  siteName?: string;
  siteDescription?: string;
  logoId?: string;
  faviconId?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultSeoImage?: string;
  socialLinks?: Record<string, string>;
  // ── Contact / Float buttons ──────────────────────────────
  hotline?: string;
  zaloUrl?: string;
  facebookUrl?: string;
  // ── Trial registration notifications ─────────────────────
  trialNotifyEmail?: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.siteSetting.findFirst();
    if (!settings) {
      return this.prisma.siteSetting.create({ data: {} });
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto) {
    const existing = await this.prisma.siteSetting.findFirst();
    if (!existing) {
      return this.prisma.siteSetting.create({ data: dto });
    }
    return this.prisma.siteSetting.update({
      where: { id: existing.id },
      data: {
        siteName: dto.siteName,
        siteDescription: dto.siteDescription,
        logoId: dto.logoId,
        faviconId: dto.faviconId,
        defaultSeoTitle: dto.defaultSeoTitle,
        defaultSeoDescription: dto.defaultSeoDescription,
        defaultSeoImage: dto.defaultSeoImage,
        socialLinks: dto.socialLinks,
        hotline: dto.hotline,
        zaloUrl: dto.zaloUrl,
        facebookUrl: dto.facebookUrl,
        trialNotifyEmail: dto.trialNotifyEmail,
      },
    });
  }
}
