import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true }) // Aggiunge automaticamente createdAt e updatedAt
export class Post {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  authorId: string; // ID dell'utente dal User Service

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ type: [String], default: [] })
  tags: string[]; // Hashtags opzionali

  @Prop({ default: true })
  isPublic: boolean;

  // Campi aggiunti automaticamente da timestamps: true
  createdAt?: Date;
  updatedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
