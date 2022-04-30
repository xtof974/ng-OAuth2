import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class AuthUtilService {
  constructor() {}

  generateCodeVerifier(): string {
    return this.generateRandomString(128);
  }

  private generateRandomString(length): string {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  generateCodeChallenge(code_verifier): string {
    return this.hashToBase64URL(CryptoJS.SHA256(code_verifier));
  }

  encodeStringInBase64(string_to_encode: string): string {
    return btoa(string_to_encode);
  }

  private hashToBase64URL(hash_to_encode): string {
    const hash_base64 = hash_to_encode
      .toString(CryptoJS.enc.Base64)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return hash_base64;
  }
}
