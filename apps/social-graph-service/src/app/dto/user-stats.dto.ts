import { IsNotEmpty, IsString } from 'class-validator';

export class UserStatsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
