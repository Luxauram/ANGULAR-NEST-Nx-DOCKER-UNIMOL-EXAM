import { IsUUID, IsNotEmpty } from 'class-validator';

export class NewPostWebhookDto {
  @IsUUID('4', { message: 'authorId deve essere un UUID valido' })
  @IsNotEmpty({ message: 'authorId è obbligatorio' })
  authorId: string;
}

export class FollowChangeWebhookDto {
  @IsUUID('4', { message: 'userId deve essere un UUID valido' })
  @IsNotEmpty({ message: 'userId è obbligatorio' })
  userId: string;
}
