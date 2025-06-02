export interface FeedItem {
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserFeed {
  userId: string;
  items: FeedItem[];
  lastUpdated: Date;
  totalItems: number;
}
