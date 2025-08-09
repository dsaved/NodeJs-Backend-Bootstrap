import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  generateSecret(
    app: string,
    email: string,
  ): { otpauthUrl: string; base32: string } {
    const secret = speakeasy.generateSecret({
      name: `${app} (${email})`,
    });

    return {
      otpauthUrl: secret.otpauth_url,
      base32: secret.base32,
    };
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  isCodeValid(code: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 0,
    });
  }

  validateCode(code: string, secret: string): boolean {
    return this.isCodeValid(code, secret);
  }
}
