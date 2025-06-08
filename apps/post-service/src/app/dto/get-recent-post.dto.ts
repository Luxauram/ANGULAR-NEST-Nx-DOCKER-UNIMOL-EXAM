import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class GetRecentPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
