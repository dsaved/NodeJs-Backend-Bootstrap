import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const NO_AUTH_KEY = 'noAuth';
export const NoAuth = () => SetMetadata(NO_AUTH_KEY, true);
