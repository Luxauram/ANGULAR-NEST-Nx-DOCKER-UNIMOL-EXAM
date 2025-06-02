import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class GetFollowersDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
