import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsIn,
} from 'class-validator';

export class TrendingPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Il limit deve essere un numero' })
  @Min(1, { message: 'Il limit deve essere almeno 1' })
  @Max(50, { message: 'Il limit non può superare 50' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Il timeframe deve essere una stringa' })
  @IsIn(['1h', '24h', '7d', '30d'], {
    message: 'Il timeframe deve essere: 1h, 24h, 7d, o 30d',
  })
  timeframe?: string = '24h';
}
