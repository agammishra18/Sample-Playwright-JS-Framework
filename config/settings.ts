import 'dotenv/config';
import { getEnvironmentConfig } from './environment.config';

export type Platform = 'web' | 'android' | 'ios';

export function getPlatform(): Platform {
  const raw = (process.env.PLATFORM || 'web').toLowerCase();
  if (raw !== 'web' && raw !== 'android' && raw !== 'ios') {
    throw new Error(`Invalid PLATFORM "${raw}". Must be one of: web, android, ios`);
  }
  return raw;
}

export function isMobile(): boolean {
  return getPlatform() !== 'web';
}

export { getEnvironmentConfig };
