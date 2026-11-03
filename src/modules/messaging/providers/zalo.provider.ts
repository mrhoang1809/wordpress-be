import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';

export interface ZaloSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Zalo Official Account (OA) messaging provider.
 * Docs: https://developers.zalo.me/docs/api/official-account-api/gui-tin-nhan/gui-tin-nhan-post-5127
 *
 * Sends messages via the Zalo OA Open API.
 * Requires ZALO_OA_ID, ZALO_OA_SECRET, and ZALO_OA_REFRESH_TOKEN.
 */
@Injectable()
export class ZaloProvider {
  private readonly logger = new Logger(ZaloProvider.name);

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private get config() {
    return this.configService.get('messaging', { infer: true }).zalo;
  }

  isConfigured(): boolean {
    const c = this.config;
    return !!(c.oaId && c.oaSecret && c.oaRefreshToken);
  }

  /**
   * Get a fresh OA access token using the refresh token.
   * The access token from Zalo expires after 24 hours.
   */
  async getAccessToken(): Promise<string> {
    const c = this.config;
    if (!this.isConfigured()) {
      throw new Error('Zalo OA not configured — set ZALO_OA_ID, ZALO_OA_SECRET, ZALO_OA_REFRESH_TOKEN');
    }

    const url = `${c.apiUrl}/oa/access_token`;
    const body = {
      refresh_token: c.oaRefreshToken,
      app_id: c.oaId,
      grant_type: 'refresh_token',
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zalo token refresh failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { access_token?: string; error?: number; message?: string };
    if (data.error) {
      throw new Error(`Zalo token error: ${data.message ?? data.error}`);
    }

    return data.access_token!;
  }

  /**
   * Send a text message to a Zalo user.
   * Docs: POST /v2.0/oa/message
   */
  async sendTextMessage(accessToken: string, zaloUserId: string, text: string): Promise<ZaloSendResult> {
    return this.sendMessage(accessToken, zaloUserId, {
      recipient: { user_id: zaloUserId },
      message: { text },
    });
  }

  /**
   * Send an image message to a Zalo user.
   */
  async sendImageMessage(accessToken: string, zaloUserId: string, imageUrl: string, caption?: string): Promise<ZaloSendResult> {
    return this.sendMessage(accessToken, zaloUserId, {
      recipient: { user_id: zaloUserId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [
              {
                media_type: 'image',
                url: imageUrl,
                ...(caption ? { caption: caption } : {}),
              },
            ],
          },
        },
      },
    });
  }

  /**
   * Send a generic message to a Zalo user via the OA API.
   */
  private async sendMessage(accessToken: string, zaloUserId: string, body: Record<string, unknown>): Promise<ZaloSendResult> {
    const c = this.config;
    const url = `${c.apiUrl}/oa/message`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken,
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        error?: number;
        message?: string;
        data?: { msg_id?: string };
      };

      if (data.error && data.error !== 0) {
        return { success: false, error: data.message ?? `Zalo error ${data.error}` };
      }

      return { success: true, messageId: data.data?.msg_id };
    } catch (err) {
      this.logger.error(`Zalo send failed for user ${zaloUserId}`, err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * High-level dispatch — picks the right method based on message type.
   */
  async send(zaloUserId: string, content: Record<string, unknown>): Promise<ZaloSendResult> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Zalo OA not configured' };
    }

    const accessToken = await this.getAccessToken();
    const messageType = (content.messageType as string) ?? 'text';

    switch (messageType) {
      case 'text':
        return this.sendTextMessage(accessToken, zaloUserId, (content.text as string) ?? '');

      case 'image': {
        const imageUrl = content.imageUrl as string;
        const caption = content.caption as string | undefined;
        return this.sendImageMessage(accessToken, zaloUserId, imageUrl, caption);
      }

      default:
        // Fallback: send as text with the content serialized
        return this.sendTextMessage(accessToken, zaloUserId, JSON.stringify(content));
    }
  }
}
