export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  username?: string; // Per mostrare chi ha fatto il post
}

export interface CreatePostDto {
  content: string;
}
