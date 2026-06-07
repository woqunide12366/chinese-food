export interface Dish {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  image: string;
  video?: string;
  ingredients: string[];
  steps: Step[];
  tips?: string;
  difficulty: "简单" | "中等" | "困难";
  time: string;
  isAncient?: boolean;
  ancientInfo?: {
    dynasty: string;
    origin: string;
    story: string;
  };
  likes: number;
  author?: string;
  createdAt: string;
}

export interface Step {
  order: number;
  description: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  dishCount: number;
  group: "八大菜系" | "地方菜系";
  region?: string;
}

export interface Message {
  id: string;
  type: "guestbook" | "submission" | "question";
  name: string;
  avatar?: string;
  content: string;
  dishName?: string;
  contact?: string;
  reply?: string;
  createdAt: string;
  status?: "pending" | "approved" | "rejected";
}

export interface User {
  name: string;
  avatar?: string;
  favorites: string[];
  submissions: string[];
}

export interface Snack {
  id: string;
  name: string;
  region: string;
  regionId: string;
  city: string;
  description: string;
  image: string;
  history?: string;
  features: string[];
  likes: number;
  recipe?: {
    ingredients: string[];
    steps: string[];
    tips?: string;
  };
}
