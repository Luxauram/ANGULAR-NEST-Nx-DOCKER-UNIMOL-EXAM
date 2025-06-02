import { IsUUID, IsOptional, IsNumberString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFeedDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  @Min(0)
  offset?: number = 0;
}

export class RefreshFeedDto {
  @IsUUID()
  userId: string;
}
