import { PaginationInterface } from '../../constructs/interfaces';

export class RequestResponseDto {
  success: boolean;
  message: string;
}

export class ResultResponseDto {
  result: any[];
  pagination: PaginationInterface;
}
