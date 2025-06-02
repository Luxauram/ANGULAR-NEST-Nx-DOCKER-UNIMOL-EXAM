export interface UserNode {
  id: string;
  username: string;
  email: string;
}

export interface FollowRelationship {
  follower: UserNode;
  following: UserNode;
  createdAt: Date;
}
