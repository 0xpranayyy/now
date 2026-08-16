import { Moment, User } from './types';

export const MOCK_USERS: Record<string, User> = {
  founder: {
    id: 'founder',
    username: 'founder',
    name: 'Founder',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=founder',
  },
  user1: {
    id: 'user1',
    username: 'alice',
    name: 'Alice',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=alice',
  },
  user2: {
    id: 'user2',
    username: 'bob',
    name: 'Bob',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=bob',
  }
};

export const MOCK_MOMENTS: Moment[] = [
  {
    id: 'm1',
    title: 'Secret DJ Set',
    description: 'Special guest playing right now. The line is moving fast.',
    locationName: 'The Basement',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    participantCount: 42,
    likesCount: 120,
    category: 'nightlife',
    isLive: true,
    trendingScore: 95,
    createdAt: new Date().toISOString(),
    posts: [
      {
        id: 'p1',
        momentId: 'm1',
        author: MOCK_USERS.user1,
        content: 'Vibe is unreal tonight! 🔊',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 'p2',
        momentId: 'm1',
        author: MOCK_USERS.founder,
        content: 'Just walked in. Get here now.',
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      }
    ]
  },
  {
    id: 'm2',
    title: 'Late Night Tacos',
    description: 'The truck is finally back.',
    locationName: '5th & Main',
    coordinates: { lat: 37.7849, lng: -122.4094 },
    participantCount: 15,
    likesCount: 30,
    category: 'food',
    isLive: true,
    trendingScore: 82,
    createdAt: new Date().toISOString(),
    posts: []
  },
  {
    id: 'm3',
    title: 'Spontaneous Park Jam',
    locationName: 'Washington Square Park',
    coordinates: { lat: 37.7649, lng: -122.4294 },
    participantCount: 8,
    likesCount: 15,
    category: 'spontaneous',
    isLive: true,
    trendingScore: 78,
    createdAt: new Date().toISOString(),
    posts: [
      {
        id: 'p3',
        momentId: 'm3',
        author: MOCK_USERS.user2,
        content: 'Someone brought a saxophone 🎷',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      }
    ]
  }
];
