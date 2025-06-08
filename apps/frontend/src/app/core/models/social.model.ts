export interface SocialStats {
  userId: string;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  lastUpdated?: Date;
}

export interface FollowDto {
  targetUserId: string;
  targetUsername?: string;
}

export interface FollowRelationship {
  isFollowing: boolean;
  isFollowedBy: boolean;
  canFollow: boolean;
}

export interface UserFollow {
  userId: string;
  username: string;
  email?: string;
  followedAt: Date;
  isActive: boolean;
}

export interface FollowListResponse {
  data: UserFollow[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
