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

// DTOs
export class CreatePostDto {
  title: string;
  content: string;
  tags?: string[];
}

export class UpdatePostDto {
  title?: string;
  content?: string;
  tags?: string[];
}

export class GetPostsQueryDto {
  page?: number;
  limit?: number;
  userId?: string;
  tags?: string;
}

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
    const userId = req.user.userId;
    console.log('📝 Creating post for user:', userId);

    // Aggiungi l'userId al post
    const postData = {
      ...createPostDto,
      userId,
    };

    return await this.microserviceService.post('post', '/posts', postData);
  }

  /**
   * GET /api/posts
   * Ottieni lista post con filtri e paginazione
   */
  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    console.log('📋 Getting posts with filters:', query);

    return await this.microserviceService.get('post', '/posts', query);
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
      userId,
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

    // Il Post Service dovrebbe verificare che l'utente sia il proprietario
    const postData = {
      ...updatePostDto,
      requesterId: userId, // Per verificare ownership
    };

    return await this.microserviceService.put('post', `/posts/${id}`, postData);
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

    // Passiamo l'userId per verificare ownership nel Post Service
    return await this.microserviceService.delete(
      'post',
      `/posts/${id}?requesterId=${userId}`
    );
  }

  /**
   * POST /api/posts/:id/like
   * Like/Unlike post (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Request() req, @Param('id') postId: string) {
    const userId = req.user.userId;
    console.log('❤️ Toggling like on post:', postId, 'by user:', userId);

    return await this.microserviceService.post(
      'post',
      `/posts/${postId}/like`,
      { userId }
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

    const queryWithUserId = {
      ...query,
      userId,
    };

    return await this.microserviceService.get(
      'post',
      '/posts',
      queryWithUserId
    );
  }
}
