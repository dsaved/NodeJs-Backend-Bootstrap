import { ApplicationFile } from '../../model/application-files.model';

export class FileUploadResponseDto {
  fileName: string;
  mimeType: string;
  key: string;
  id: number;
  eTag: string;

  constructor(data: ApplicationFile) {
    this.fileName = data.name;
    this.mimeType = data.mimeType;
    this.key = data.key;
    this.id = data.id;
    this.eTag = data.eTag;
  }
}

export class FileUploadUrlResponseDto {
  fileName: string;
  mimeType: string;
  key: string;
  id: number;
  url: string;

  constructor(data: ApplicationFile, url: string) {
    this.fileName = data.name;
    this.mimeType = data.mimeType;
    this.key = data.key;
    this.id = data.id;
    this.url = url;
  }
}
export class FilePreviewUrlResponseDto {
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}