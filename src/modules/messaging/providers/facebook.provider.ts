import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';

export interface FacebookSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Facebook Messenger Send API provider.
 * Docs: https://developers.facebook.com/docs/messenger-platform/send-messages
 *
 * Sends messages via the Facebook Graph API.
 * Requires FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN.
 */
@Injectable()
export class FacebookProvider {
  private readonly logger = new Logger(FacebookProvider.name);

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private get config() {
    return this.configService.get('messaging', { infer: true }).facebook;
  }

  isConfigured(): boolean {
    const c = this.config;
    return !!(c.pageId && c.pageAccessToken);
  }

  private get baseUrl(): string {
    return `https://graph.facebook.com/${this.config.graphApiVersion}/${this.config.pageId}/messages`;
  }

  /**
   * Send a text message to a Facebook user via the Messenger Send API.
   * The PSID (Page-Scoped ID) identifies the user relative to the page.
   */
  async sendTextMessage(psid: string, text: string): Promise<FacebookSendResult> {
    return this.sendToGraph({
      recipient: { id: psid },
      message: { text },
      messaging_type: 'RESPONSE',
    });
  }

  /**
   * Send an image attachment.
   */
  async sendImageMessage(psid: string, imageUrl: string): Promise<FacebookSendResult> {
    return this.sendToGraph({
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'image',
          payload: { url: imageUrl, is_reusable: true },
        },
      },
    });
  }

  /**
   * Send a button template message (up to 3 buttons).
   */
  async sendButtonTemplate(
    psid: string,
    text: string,
    buttons: Array<{ type: string; title: string; url?: string; payload?: string }>,
  ): Promise<FacebookSendResult> {
    return this.sendToGraph({
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text,
            buttons,
          },
        },
      },
    });
  }

  /**
   * Send a generic template (card layout with images, title, subtitle, buttons).
   */
  async sendGenericTemplate(
    psid: string,
    elements: Array<{
      title: string;
      image_url?: string;
      subtitle?: string;
      buttons?: Array<{ type: string; title: string; url?: string }>;
    }>,
  ): Promise<FacebookSendResult> {
    return this.sendToGraph({
      recipient: { id: psid },
      message: {
        attachment: {
          type: 'template',
          payload: { template_type: 'generic', elements },
        },
      },
    });
  }

  /**
   * Core send method — calls the Graph API.
   */
  private async sendToGraph(body: Record<string, unknown>): Promise<FacebookSendResult> {
    const c = this.config;
    if (!this.isConfigured()) {
      return { success: false, error: 'Facebook not configured — set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN' };
    }

    try {
      const res = await fetch(`${this.baseUrl}?access_token=${encodeURIComponent(c.pageAccessToken)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        message_id?: string;
        recipient_id?: string;
        error?: { message: string; code: number; fbtrace_id?: string };
      };

      if (!res.ok || data.error) {
        return {
          success: false,
          error: data.error?.message ?? `HTTP ${res.status}`,
        };
      }

      return { success: true, messageId: data.message_id };
    } catch (err) {
      this.logger.error('Facebook send failed', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * High-level dispatch — picks the right method based on message type.
   */
  async send(psid: string, content: Record<string, unknown>): Promise<FacebookSendResult> {
    const messageType = (content.messageType as string) ?? 'text';

    switch (messageType) {
      case 'text':
        return this.sendTextMessage(psid, (content.text as string) ?? '');

      case 'image':
        return this.sendImageMessage(psid, (content.imageUrl as string) ?? '');

      case 'button': {
        const text = content.text as string;
        const buttons = (content.buttons as Array<{ type: string; title: string; url?: string; payload?: string }>) ?? [];
        return this.sendButtonTemplate(psid, text, buttons);
      }

      case 'generic': {
        const elements = (content.elements as Array<{ title: string; image_url?: string; subtitle?: string; buttons?: Array<{ type: string; title: string; url?: string }> }>) ?? [];
        return this.sendGenericTemplate(psid, elements);
      }

      default:
        return this.sendTextMessage(psid, JSON.stringify(content));
    }
  }
}
