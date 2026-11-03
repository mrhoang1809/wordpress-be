import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);

  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  async revalidate(type: string, slug: string): Promise<void> {
    const { secret, url } = this.configService.get('revalidation', { infer: true });

    if (!secret || !url) {
      this.logger.warn('Revalidation not configured — skipping cache revalidation');
      return;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidation-secret': secret,
        },
        body: JSON.stringify({ type, slug }),
      });

      if (!res.ok) {
        this.logger.error(`Revalidation failed for ${type}:${slug} — ${res.status}`);
      } else {
        this.logger.log(`Revalidated ${type}:${slug}`);
      }
    } catch (err) {
      this.logger.error(`Revalidation request error for ${type}:${slug}`, err);
    }
  }
}
