import { IsOptional, ValidateIf } from "class-validator";

export class BaseRequestDto {
    
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  search: string;

  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  resultPerPage: number;

  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  page: number;

}
