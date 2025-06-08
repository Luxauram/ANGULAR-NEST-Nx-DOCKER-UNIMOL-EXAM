import { IsNotEmpty, IsString } from 'class-validator';

export class UnfollowUserDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
