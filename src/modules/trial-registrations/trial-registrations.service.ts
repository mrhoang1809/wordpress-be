import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SettingsService } from '../settings/settings.service';
import * as nodemailer from 'nodemailer';

export interface CreateTrialRegistrationDto {
  name: string;
  phone: string;
  locationId?: string;
  source?: string;
}

@Injectable()
export class TrialRegistrationsService {
  private readonly logger = new Logger(TrialRegistrationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(dto: CreateTrialRegistrationDto) {
    // 1. Persist to DB
    const registration = await this.prisma.trialRegistration.create({
      data: {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        locationId: dto.locationId || null,
        source: dto.source || null,
      },
      include: {
        location: { select: { name: true, address: true, phone: true } },
      },
    });

    // 2. Send email notification (best-effort, never fail the user)
    this.sendNotificationEmail(registration).catch((err) => {
      this.logger.warn('Failed to send trial registration email', err);
    });

    return { success: true, id: registration.id };
  }

  async findAll(params?: { page?: number; pageSize?: number }) {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.trialRegistration.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          location: { select: { name: true, address: true } },
        },
      }),
      this.prisma.trialRegistration.count(),
    ]);

    return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  // ─── Email notification ──────────────────────────────────────────────────────

  private async sendNotificationEmail(
    registration: Awaited<ReturnType<typeof this.prisma.trialRegistration.create>>,
  ) {
    // Load notify email from settings
    const settings = await this.settingsService.get();
    const toEmail = (settings as any).trialNotifyEmail as string | null;

    if (!toEmail) {
      this.logger.debug('No trialNotifyEmail set — skipping email notification');
      return;
    }

    // Build transporter from env
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT ?? '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM ?? smtpUser ?? 'noreply@curves.vn';

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — email skipped');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const locationName = (registration as any).location?.name ?? 'Chưa chọn';
    const locationAddress = (registration as any).location?.address ?? '';
    const locationPhone = (registration as any).location?.phone ?? '';

    const submittedAt = new Date(registration.createdAt).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#7e22ce,#d946ef);padding:20px 24px">
          <h2 style="color:#fff;margin:0;font-size:18px">✨ Đăng Ký Tập Thử Mới</h2>
          <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:13px">${submittedAt}</p>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;width:130px">Họ và tên</td><td style="padding:8px 0;font-weight:700;color:#111827">${registration.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Số điện thoại</td><td style="padding:8px 0;font-weight:700;color:#111827"><a href="tel:${registration.phone}" style="color:#7e22ce">${registration.phone}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Chi nhánh</td><td style="padding:8px 0;color:#111827">${locationName}${locationAddress ? `<br><span style="color:#6b7280;font-size:12px">${locationAddress}</span>` : ''}${locationPhone ? `<br><span style="color:#6b7280;font-size:12px">☎ ${locationPhone}</span>` : ''}</td></tr>
            ${registration.source ? `<tr><td style="padding:8px 0;color:#6b7280">Nguồn</td><td style="padding:8px 0;color:#6b7280;font-size:12px">${registration.source}</td></tr>` : ''}
          </table>
        </div>
        <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
          Curves Vietnam CMS — thông báo tự động
        </div>
      </div>`;

    await transporter.sendMail({
      from: `"Curves Vietnam" <${smtpFrom}>`,
      to: toEmail,
      subject: `[Curves] Đăng ký tập thử: ${registration.name} — ${locationName}`,
      html,
      text: `Đăng ký tập thử mới:\nTên: ${registration.name}\nSĐT: ${registration.phone}\nChi nhánh: ${locationName}\nGiờ: ${submittedAt}`,
    });

    this.logger.log(`Trial registration email sent to ${toEmail}`);
  }
}
