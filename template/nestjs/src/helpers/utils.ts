import { classes, interfaces } from '../constructs';
import * as CryptoJS from 'crypto-js';

export const getPagination = (
  count: number,
  page: number,
  offset: number,
  limit: number,
): interfaces.PaginationInterface => {
  const pages: number = Math.ceil(count / limit);
  const end: number = Math.min(offset + limit, count);
  return {
    total: count,
    pages: pages,
    page: page < pages ? page : pages,
    start: count > 0 ? offset + 1 : 0,
    end: end,
    haspages: page < pages || page > 1,
    hasNext: page < pages,
    hasPrevious: page > 1,
  };
};

export const ucfirstword = (string: string): string => {
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function hexCode(param: classes.HexcodeType): string {
  const chars = 'acdefhiklmnoqrstuvwxyz0123456789'.split('');
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numberChars = '0123456789'.split('');
  const specialChars = '@$!%*?&'.split('');

  let result = '';

  if (param.strong) {
    // Ensure at least one of each required character type is included
    result += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    result += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    result += numberChars[Math.floor(Math.random() * numberChars.length)];
    result += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest of the password length with random characters
    while (result.length < param.count) {
      const x = Math.floor(Math.random() * chars.length);
      result += chars[x];
    }

    // Shuffle the result to ensure randomness
    result = result
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');

    // Ensure the password length is between 8 and 20 characters
    if (result.length < 8) {
      result += chars[Math.floor(Math.random() * chars.length)].repeat(
        8 - result.length,
      );
    } else if (result.length > 20) {
      result = result.slice(0, 20);
    }
  } else {
    for (let i = 0; i < param.count; i++) {
      const x = Math.floor(Math.random() * chars.length);
      result += chars[x];
    }
  }

  result =
    (param.prefix ? param.prefix : '') +
    result +
    (param.prefix ? param.prefix : '');
  if (param.caps) {
    result = result.toUpperCase();
  }

  return result;
}

export function createConsistentHash(key: string): string {
  return CryptoJS.MD5(key).toString(CryptoJS.enc.Hex);
}

export function numberCode(count: number): string {
  const chars = '0123456789'.split('');
  let result = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }
  return result;
}

export function removeNulls<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined),
  ) as Partial<T>;
}
