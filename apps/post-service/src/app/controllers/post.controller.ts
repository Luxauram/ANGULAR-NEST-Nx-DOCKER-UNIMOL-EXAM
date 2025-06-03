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
  UsePipes,
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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  )
  async create(@Body() createPostDto: CreatePostDto) {
    console.log('🎯 POST SERVICE - Request received!');
    console.log(
      '📝 POST SERVICE - Raw body:',
      JSON.stringify(createPostDto, null, 2)
    );
    console.log('📝 POST SERVICE - Body type:', typeof createPostDto);
    console.log(
      '📝 POST SERVICE - Body keys:',
      Object.keys(createPostDto || {})
    );
    return this.postService.createPost(createPostDto);
  }

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  )
  async findAll(@Query() query: GetPostsQueryDto) {
    console.log('📋 Post Service - Query params:', query);
    return this.postService.getPosts(query);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.postService.getPostsByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    })
  )
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Headers('x-user-id') userId: string
  ) {
    console.log(
      '✏️ Post Service - Update data:',
      updatePostDto,
      'User ID:',
      userId
    );
    return this.postService.updatePost(id, updatePostDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    console.log('🗑️ Post Service - Delete post:', id, 'User ID:', userId);
    return this.postService.deletePost(id, userId);
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    console.log('❤️ Post Service - Like post:', id);
    return this.postService.likePost(id);
  }

  @Post(':id/unlike')
  async unlike(@Param('id') id: string) {
    console.log('💔 Post Service - Unlike post:', id);
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
