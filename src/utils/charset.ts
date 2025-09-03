export const SAFE_CHARSET = '2356789BCDEFGHJKLMNPQRSTUVWXYZ';

export function validateCharset(charset: string): boolean {
  if (charset.length < 2) {
    return false;
  }

  const uniqueChars = new Set(charset);
  if (uniqueChars.size !== charset.length) {
    return false;
  }

  return true;
}

export function generateRandomString(charset: string, length: number): string {
  const chars = charset.split('');
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

export function generateCryptoRandomString(charset: string, length: number): string {
  const crypto = require('crypto');
  const chars = charset.split('');
  const charsetLength = chars.length;
  let result = '';

  const randomBytes = crypto.randomBytes(length * 2);

  for (let i = 0; i < length; i++) {
    const byte = randomBytes[i * 2] + (randomBytes[i * 2 + 1] << 8);
    result += chars[byte % charsetLength];
  }

  return result;
}