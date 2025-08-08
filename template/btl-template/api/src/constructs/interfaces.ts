export interface Attachment {
  filename: string;
  content?: Buffer;
  path?: string;
  encoding?: string;
  contentType?: string;
}
export interface SupportingDocument {
  type: string;
  mimeType: string;
  file: string;
}
export interface ImageData {
  id: number;
  name: string;
  key: string;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface PaginationInterface {
  total: number;
  pages: number;
  page: number;
  start: number;
  end: number;
  haspages: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface HexCode {
  count: number;
  caps?: boolean;
  prefix?: string;
  surfix?: string;
}
export interface OccupationDto {
  id: number;
  occupation: string;
}
export interface EducationLevelDto {
  id: number;
  description: string;
}
export interface EthnicityDto{
  id: number;
  name: string;
}


