export interface HexCode {
  count: number;
  caps?: boolean;
  prefix?: string;
  surfix?: string;
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