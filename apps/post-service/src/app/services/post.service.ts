import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostsQueryDto } from '../dto/get-posts-query.dto';
import { Post } from '../models/post.model';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    // Qui potresti aggiungere validazioni aggiuntive
    // Es: verificare che l'authorId esista nel User Service
    return this.postRepository.create(createPostDto);
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async getPosts(
    query: GetPostsQueryDto
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const result = await this.postRepository.findAll(query);
    return {
      ...result,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.postRepository.findByAuthorId(authorId);
  }

  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
    requestingUserId: string
  ): Promise<Post> {
    const existingPost = await this.getPostById(id);

    // Verifica che solo l'autore possa modificare il post
    if (existingPost.authorId !== requestingUserId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.postRepository.update(id, updatePostDto);
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }

  async deletePost(id: string, requestingUserId: string): Promise<void> {
    const existingPost = await this.getPostById(id);

    // Verifica che solo l'autore possa eliminare il post
    if (existingPost.authorId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    const deleted = await this.postRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async likePost(id: string): Promise<Post> {
    const post = await this.postRepository.incrementLikes(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async unlikePost(id: string): Promise<Post> {
    const post = await this.postRepository.decrementLikes(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async incrementCommentCount(id: string): Promise<Post> {
    const post = await this.postRepository.incrementComments(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
}
