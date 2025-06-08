export interface Post {
  id: string;
  title?: string;
  content: string;
  userId: string;
  username?: string;
  tags?: string[];
  isPublic: boolean;
  liked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PostFilters {
  userId?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface PostStats {
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
}

export enum PostPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export interface PostAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface GetPostsQuery {
  userId?: string;
  page?: number;
  limit?: number;
  tag?: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
