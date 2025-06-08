import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class GetTimelineDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La page deve essere un numero' })
  @Min(1, { message: 'La page deve essere almeno 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Il limit deve essere un numero' })
  @Min(1, { message: 'Il limit deve essere almeno 1' })
  @Max(100, { message: 'Il limit non può superare 100' })
  limit?: number = 20;
}
