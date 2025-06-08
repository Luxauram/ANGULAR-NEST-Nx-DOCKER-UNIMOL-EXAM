import { IsUUID } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class GetTimelineDto extends PaginationDto {
  @IsUUID('4', { message: 'userId deve essere un UUID valido' })
  userId: string;
}
