// apps/social-graph-service/src/app/controllers/social-graph.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { SocialGraphService } from '../services/social-graph.service';
import { FollowUserDto } from '../dto/follow-user.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';

@Controller('social-graph')
export class SocialGraphController {
  constructor(private socialGraphService: SocialGraphService) {}

  // POST /social-graph/users - Crea un nodo utente
  @Post('users')
  async createUser(
    @Body() body: { userId: string; username: string; email: string }
  ) {
    return await this.socialGraphService.createUser(
      body.userId,
      body.username,
      body.email
    );
  }

  // POST /social-graph/follow - Segui un utente
  @Post('follow')
  async followUser(@Body(ValidationPipe) followUserDto: FollowUserDto) {
    return await this.socialGraphService.followUser(followUserDto);
  }

  // DELETE /social-graph/follow/:followerId/:followingId - Smetti di seguire
  @Delete('follow/:followerId/:followingId')
  async unfollowUser(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string
  ) {
    return await this.socialGraphService.unfollowUser(followerId, followingId);
  }

  // GET /social-graph/followers/:userId - Ottieni followers
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('limit') limit?: string
  ) {
    const getFollowersDto: GetFollowersDto = { userId, limit };
    return await this.socialGraphService.getFollowers(getFollowersDto);
  }

  // GET /social-graph/following/:userId - Ottieni following
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('limit') limit?: string
  ) {
    const limitNumber = limit ? parseInt(limit) : 50;
    return await this.socialGraphService.getFollowing(userId, limitNumber);
  }

  // GET /social-graph/stats/:userId - Ottieni statistiche utente
  @Get('stats/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return await this.socialGraphService.getUserStats(userId);
  }

  // GET /social-graph/check-follow/:followerId/:followingId - Controlla se segue
  @Get('check-follow/:followerId/:followingId')
  async checkFollowStatus(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string
  ) {
    return await this.socialGraphService.checkFollowStatus(
      followerId,
      followingId
    );
  }

  // Health check
  @Get('health')
  async healthCheck() {
    return { status: 'OK', service: 'social-graph-service' };
  }
}
