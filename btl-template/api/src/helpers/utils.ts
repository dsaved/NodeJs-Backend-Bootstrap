import { classes, interfaces } from '../constructs';
import awsS3bucket from '../helpers/aws.s3';
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

export const getS3fileAsBase64 = async (key: string): Promise<string> => {
  if (!key) return key;
  const s3GetObjectResponse = await awsS3bucket.getFile(key);
  return await s3GetObjectResponse.Body.transformToString('base64');
};

export const getS3fileUrl = async (key: string): Promise<string> => {
  if (!key) return key;
  return await awsS3bucket.getPresignedUrl(key);
};

export const ucfirstword = (string: string): string => {
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getDocuments = async (
  documents: interfaces.SupportingDocument[],
): Promise<interfaces.SupportingDocument[]> => {
  if (!documents) {
    return [];
  }

  return await Promise.all(
    documents.map(async (document) => {
      if (!document.file) {
        return document;
      }
      try {
        const url = await getS3fileUrl(document.file);
        return {
          type: document.type,
          mimeType: document.mimeType,
          file: url,
        };
      } catch (error) {
        console.log(error);
        return document;
      }
    }),
  );
};

function containsAsterisk(value) {
  if (typeof value === 'string') {
    return value.includes('*');
  }
  return false;
}

export function IsNINValid(data: any) {
  if (!data) {
    return true;
  }
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (typeof data[key] === 'object') {
        if (!IsNINValid(data[key])) {
          return false;
        }
      } else {
        if (containsAsterisk(data[key])) {
          return false;
        }
      }
    }
  }
  return true;
}

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

export function formatFCMBResponse(queryString: string): any {
  function convertKeysToObject(obj: any) {
    const result = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const keys = key.split('.');

        let current = result;
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (i === keys.length - 1) {
            current[k] = value;
          } else {
            current[k] = current[k] || {};
            current = current[k];
          }
        }
      }
    }

    return result;
  }

  const params = new URLSearchParams(queryString);
  const result = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return convertKeysToObject(result);
}
export function removeNulls<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}