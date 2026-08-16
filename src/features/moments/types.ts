export type User = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
};

export type Post = {
  id: string;
  momentId: string;
  author: User;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
};

export type MomentCategory = 'nightlife' | 'event' | 'sports' | 'food' | 'spontaneous';

export type Moment = {
  id: string;
  title: string;
  description?: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  participantCount: number;
  category: MomentCategory;
  isLive: boolean;
  posts: Post[];
  trendingScore: number;
  likesCount: number;
  createdAt: string;
};
