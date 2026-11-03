"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TrialRegistrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialRegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const settings_service_1 = require("../settings/settings.service");
const nodemailer = require("nodemailer");
let TrialRegistrationsService = TrialRegistrationsService_1 = class TrialRegistrationsService {
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(TrialRegistrationsService_1.name);
    }
    async create(dto) {
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
        this.sendNotificationEmail(registration).catch((err) => {
            this.logger.warn('Failed to send trial registration email', err);
        });
        return { success: true, id: registration.id };
    }
    async findAll(params) {
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
    async sendNotificationEmail(registration) {
        const settings = await this.settingsService.get();
        const toEmail = settings.trialNotifyEmail;
        if (!toEmail) {
            this.logger.debug('No trialNotifyEmail set — skipping email notification');
            return;
        }
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
        const locationName = registration.location?.name ?? 'Chưa chọn';
        const locationAddress = registration.location?.address ?? '';
        const locationPhone = registration.location?.phone ?? '';
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
};
exports.TrialRegistrationsService = TrialRegistrationsService;
exports.TrialRegistrationsService = TrialRegistrationsService = TrialRegistrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], TrialRegistrationsService);
//# sourceMappingURL=trial-registrations.service.js.map