import { IsNotEmpty, IsString } from 'class-validator';

export class CheckFollowDto {
  @IsString()
  @IsNotEmpty()
  followerId: string;

  @IsString()
  @IsNotEmpty()
  followingId: string;
}
