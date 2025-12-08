import { User, ConnectionPurpose } from './types';

export const MAJORS = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'International Studies',
  'Communication Studies',
  'Human Resource Development'
];

export const INTERESTS = [
  'Coding', 'Basketball', 'Reading', 'Gaming', 'Hiking', 
  'Photography', 'Music', 'Volunteering', 'Chess', 'Cooking', 
  'Travel', 'Yoga', 'Movies', 'Art'
];

export const MOCK_USERS: User[] = [
  {
    id: 'u2',
    name: 'Rami Mazaoui',
    email: 'r.mazaoui@aui.ma',
    major: 'Computer Science',
    year: 'Senior',
    purpose: ConnectionPurpose.STUDY,
    interests: ['Coding', 'Gaming', 'Chess'],
    bio: 'Looking for someone to grind LeetCode with efficiently.',
    avatar: 'https://picsum.photos/200/200?random=2',
    isVerified: true
  },
  {
    id: 'u3',
    name: 'Salma Madoud',
    email: 's.madoud@aui.ma',
    major: 'Business Administration',
    year: 'Junior',
    purpose: ConnectionPurpose.SOCIAL,
    interests: ['Photography', 'Travel', 'Art'],
    bio: 'New to photography club, looking for friends to go on photo walks.',
    avatar: 'https://picsum.photos/200/200?random=3',
    isVerified: true
  },
  {
    id: 'u4',
    name: 'Hassan Hankir',
    email: 'h.hankir@aui.ma',
    major: 'Engineering',
    year: 'Sophomore',
    purpose: ConnectionPurpose.GYM,
    interests: ['Basketball', 'Hiking', 'Music'],
    bio: 'Need a spotter for morning gym sessions at the campus center.',
    avatar: 'https://picsum.photos/200/200?random=4',
    isVerified: true
  },
  {
    id: 'u5',
    name: 'Rim Bousta',
    email: 'r.bousta@aui.ma',
    major: 'Communication Studies',
    year: 'Senior',
    purpose: ConnectionPurpose.EVENTS,
    interests: ['Volunteering', 'Reading', 'Movies'],
    bio: 'I want to attend more campus events but hate going alone.',
    avatar: 'https://picsum.photos/200/200?random=5',
    isVerified: true
  },
  {
    id: 'u6',
    name: 'Hadil Raad',
    email: 'h.raad@aui.ma',
    major: 'International Studies',
    year: 'Freshman',
    purpose: ConnectionPurpose.HOBBY,
    interests: ['Cooking', 'Yoga', 'Travel'],
    bio: 'Looking for people to share recipes and maybe cook dinner on weekends.',
    avatar: 'https://picsum.photos/200/200?random=6',
    isVerified: true
  }
];

export const INITIAL_MESSAGES: Record<string, any[]> = {
  'match-1': [
    { id: 'm1', senderId: 'u2', text: 'Hey! I saw you are also into CS.', timestamp: new Date(Date.now() - 1000000) },
    { id: 'm2', senderId: 'current', text: 'Hi Rami! Yes, working on my capstone.', timestamp: new Date(Date.now() - 900000) }
  ]
};
