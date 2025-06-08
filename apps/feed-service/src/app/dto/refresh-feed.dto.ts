import { IsUUID } from 'class-validator';

export class RefreshFeedDto {
  @IsUUID()
  userId: string;
}
