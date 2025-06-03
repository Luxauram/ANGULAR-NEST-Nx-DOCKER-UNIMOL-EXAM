import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from '../dto/post/create-post.dto';
import { UpdatePostDto } from '../dto/post/update-post.dto';
import { GetPostsQueryDto } from '../dto/post/get-posts-query.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * POST /api/posts
   * Crea nuovo post (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    console.log('🔍 Received body:', createPostDto);
    console.log('🔍 User from JWT:', req.user);

    const userId = req.user.userId;

    console.log('📝 Creating post for user:', userId);

    let finalContent = createPostDto.content;
    if (createPostDto.title) {
      finalContent = `${createPostDto.title}\n\n${createPostDto.content}`;
    }

    const postData = {
      content: finalContent,
      userId: userId, // Cambiato da authorId a userId
      tags: createPostDto.tags || [],
      isPublic:
        createPostDto.isPublic !== undefined ? createPostDto.isPublic : true,
    };

    console.log('📤 Sending to Post Service:', postData);

    return await this.microserviceService.post('post', '/posts', postData);
  }

  /**
   * GET /api/posts
   * Ottieni lista post con filtri e paginazione
   */
  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    console.log('📋 Getting posts with filters:', query);

    const mappedQuery = {
      ...query,
      userId: query.userId, // Cambiato da authorId a userId
    };

    return await this.microserviceService.get('post', '/posts', mappedQuery);
  }

  /**
   * GET /api/posts/my
   * Ottieni i propri post (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyPosts(
    @Request() req,
    @Query() query: { page?: number; limit?: number }
  ) {
    const userId = req.user.userId;
    console.log('📋 Getting posts for user:', userId);

    const queryWithUserId = {
      ...query,
      userId: userId, // Cambiato da authorId a userId
    };

    return await this.microserviceService.get(
      'post',
      '/posts',
      queryWithUserId
    );
  }

  /**
   * GET /api/posts/:id
   * Ottieni singolo post
   */
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    console.log('📄 Getting post:', id);

    return await this.microserviceService.get('post', `/posts/${id}`);
  }

  /**
   * PUT /api/posts/:id
   * Aggiorna post (protetto - solo il proprietario)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePost(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const userId = req.user.userId;
    console.log('✏️ Updating post:', id, 'by user:', userId);

    let finalContent = updatePostDto.content;
    if (updatePostDto.title && updatePostDto.content) {
      finalContent = `${updatePostDto.title}\n\n${updatePostDto.content}`;
    } else if (updatePostDto.title && !updatePostDto.content) {
      finalContent = updatePostDto.title;
    }

    const postData: any = {};
    if (finalContent !== undefined) postData.content = finalContent;
    if (updatePostDto.tags !== undefined) postData.tags = updatePostDto.tags;
    if (updatePostDto.isPublic !== undefined)
      postData.isPublic = updatePostDto.isPublic;

    console.log('📤 Sending update to Post Service:', postData);

    return await this.microserviceService.patch(
      'post',
      `/posts/${id}`,
      postData,
      { 'x-user-id': userId }
    );
  }

  /**
   * DELETE /api/posts/:id
   * Elimina post (protetto - solo il proprietario)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    console.log('🗑️ Deleting post:', id, 'by user:', userId);

    return await this.microserviceService.delete(
      'post',
      `/posts/${id}`,
      undefined,
      { 'x-user-id': userId }
    );
  }

  /**
   * POST /api/posts/:id/like
   * Like/Unlike post (protetto) - Gestisce toggle automaticamente
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Request() req, @Param('id') postId: string) {
    const userId = req.user.userId;
    console.log('❤️ Toggling like on post:', postId, 'by user:', userId);

    return await this.microserviceService.post(
      'post',
      `/posts/${postId}/like`,
      {},
      { 'x-user-id': userId }
    );
  }

  /**
   * POST /api/posts/:id/unlike
   * Unlike post (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unlike')
  async unlikePost(@Request() req, @Param('id') postId: string) {
    const userId = req.user.userId;
    console.log('💔 Unliking post:', postId, 'by user:', userId);

    return await this.microserviceService.post(
      'post',
      `/posts/${postId}/unlike`,
      {},
      { 'x-user-id': userId }
    );
  }

  /**
   * POST /api/posts/:id/increment-comments
   * Incrementa il contatore dei commenti
   */
  @Post(':id/increment-comments')
  async incrementComments(@Param('id') id: string) {
    console.log('💬 Incrementing comments for post:', id);

    return await this.microserviceService.post(
      'post',
      `/posts/${id}/increment-comments`,
      {}
    );
  }

  /**
   * GET /api/posts/user/:userId
   * Ottieni post di un utente specifico
   */
  @Get('user/:userId')
  async getPostsByUser(
    @Param('userId') userId: string,
    @Query() query: { page?: number; limit?: number }
  ) {
    console.log('📋 Getting posts for user:', userId);

    return await this.microserviceService.get(
      'post',
      `/posts/user/${userId}`, // Cambiato da /posts/author/${userId} a /posts/user/${userId}
      query
    );
  }

  /**
   * Health check endpoint
   */
  @Get('health/check')
  async healthCheck() {
    return await this.microserviceService.get('post', '/posts/health/check');
  }
}
