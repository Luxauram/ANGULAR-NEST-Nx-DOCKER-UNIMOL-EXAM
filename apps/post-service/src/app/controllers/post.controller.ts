import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostsQueryDto } from '../dto/get-posts-query.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createPostDto: CreatePostDto) {
    return this.postService.createPost(createPostDto);
  }

  @Get()
  async findAll(@Query(ValidationPipe) query: GetPostsQueryDto) {
    return this.postService.getPosts(query);
  }

  @Get('author/:authorId')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.postService.getPostsByAuthor(authorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
    @Headers('x-user-id') userId: string // Simuliamo l'autenticazione con un header
  ) {
    return this.postService.updatePost(id, updatePostDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.postService.deletePost(id, userId);
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    return this.postService.likePost(id);
  }

  @Post(':id/unlike')
  async unlike(@Param('id') id: string) {
    return this.postService.unlikePost(id);
  }

  @Post(':id/increment-comments')
  async incrementComments(@Param('id') id: string) {
    return this.postService.incrementCommentCount(id);
  }

  // Health check endpoint
  @Get('health/check')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      status: 'ok',
      service: 'post-service',
      timestamp: new Date().toISOString(),
    };
  }
}
