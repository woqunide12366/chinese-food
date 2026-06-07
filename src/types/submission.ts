export interface Submission {
  id: string;
  author: string;
  avatar?: string;
  title: string;
  description: string;
  images: string[];
  videos: string[];
  tags: string[];
  region: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isUserCreated?: boolean;
  isAnonymous?: boolean;
  status?: "pending" | "approved" | "rejected";
  userId?: string; // 注册用户手机号
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  images?: string[];
  createdAt: string;
  isAnonymous?: boolean;
}
