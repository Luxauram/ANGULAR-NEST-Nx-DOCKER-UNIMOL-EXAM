/* eslint-disable @typescript-eslint/no-inferrable-types */
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

  async getRecentPosts(
    limit: number = 10,
    offset: number = 0
  ): Promise<Post[]> {
    try {
      console.log(
        `📰 Getting recent posts - limit: ${limit}, offset: ${offset}`
      );
      const posts = await this.postRepository.findRecent(limit, offset);
      console.log(`✅ Found ${posts.length} recent posts`);
      return posts;
    } catch (error) {
      console.error('❌ Error getting recent posts:', error);
      throw new Error('Failed to get recent posts');
    }
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return this.postRepository.findByUserId(userId);
  }

  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
    requestingUserId: string
  ): Promise<Post> {
    const existingPost = await this.getPostById(id);
    if (existingPost.userId !== requestingUserId) {
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
    if (existingPost.userId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    const deleted = await this.postRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async likePost(id: string, userId: string): Promise<Post> {
    await this.getPostById(id);

    const post = await this.postRepository.incrementLikes(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async unlikePost(id: string, userId: string): Promise<Post> {
    await this.getPostById(id);

    const post = await this.postRepository.decrementLikes(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async incrementCommentCount(id: string, userId: string): Promise<Post> {
    await this.getPostById(id);

    const post = await this.postRepository.incrementComments(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
}
