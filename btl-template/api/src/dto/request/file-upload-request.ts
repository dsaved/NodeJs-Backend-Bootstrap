import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsBase64File, IsValidMimeType } from '../class-validators';
import { regExp } from '../../constructs';
import { MESSAGES } from '../../constructs/messages';

export class FileUploadRequestDto {
  @IsNotEmpty()
  @IsString()
  @Matches(regExp.fileNameRegExp, {
    message: MESSAGES.fileNameRegExpError,
  })
  fileName: string;

  @IsValidMimeType()
  mimeType: string;

  @IsBase64File()
  base64File: string;
}

export class FileUploadUrlRequestDto {
  @IsNotEmpty()
  @IsString()
  @Matches(regExp.fileNameRegExp, {
    message: MESSAGES.fileNameRegExpError,
  })
  fileName: string;

  @IsValidMimeType()
  mimeType: string;
}