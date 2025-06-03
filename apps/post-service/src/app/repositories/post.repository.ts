import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../models/post.model';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostsQueryDto } from '../dto/get-posts-query.dto';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = new this.postModel(createPostDto);
    return post.save();
  }

  async findById(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async findAll(
    query: GetPostsQueryDto
  ): Promise<{ posts: Post[]; total: number }> {
    const { userId, page = 1, limit = 10, tag } = query;
    const skip = (page - 1) * limit;

    // Costruisci il filtro
    const filter: any = { isPublic: true };

    if (userId) {
      filter.userId = userId;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    // Esegui query con paginazione
    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ createdAt: -1 }) // Ordina per data decrescente
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return { posts, total };
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.postModel
      .find({ userId, isPublic: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async incrementLikes(id: string): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, { $inc: { likesCount: 1 } }, { new: true })
      .exec();
  }

  async decrementLikes(id: string): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, { $inc: { likesCount: -1 } }, { new: true })
      .exec();
  }

  async incrementComments(id: string): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, { $inc: { commentsCount: 1 } }, { new: true })
      .exec();
  }
}
