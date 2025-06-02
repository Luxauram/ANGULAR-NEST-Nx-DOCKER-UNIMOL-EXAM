import { IsNotEmpty, IsString } from 'class-validator';

export class FollowUserDto {
  @IsString()
  @IsNotEmpty()
  followerId: string;

  @IsString()
  @IsNotEmpty()
  followingId: string;
}
