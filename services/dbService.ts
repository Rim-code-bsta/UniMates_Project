import { User, MatchRequest, Message, Report, UserRole, MatchPurpose, MatchStatus, Notification, ReportStatus } from '../types';

// --- HELPERS ---

const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Simple mock hash function for demonstration
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash_${hash}`;
};

// --- DATA SEEDING ---

const MAJORS = ['Computer Science', 'Business Administration', 'Engineering', 'International Studies', 'Communication', 'Human Resource Development'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const INTERESTS_LIST = ['Football', 'Chess', 'Anime', 'Coding', 'Hiking', 'Photography', 'Music', 'Gaming', 'Reading', 'Travel', 'Cooking', 'Art', 'Debate', 'Yoga', 'Politics'];
const NAMES = [
  'Youssef Benjelloun', 'Salma Alami', 'Omar Tazi', 'Hiba Berrada', 'Mehdi Chaoui', 
  'Kenza Fassi', 'Amine Idrissi', 'Ghita Bennani', 'Hamza Daoudi', 'Rania Mansouri',
  'Sofia El Fassi', 'Karim Bouzidi', 'Yasmina Akil', 'Nabil Harrak', 'Leila Chraibi',
  'Driss Sefrioui', 'Meryem Alaoui', 'Zineb Kadiri', 'Ali Amrani', 'Fatima Zahra',
  'Riad Hachimi', 'Noura Bensouda', 'Tarik Jettou', 'Samia Belhaj', 'Hassan El Ouali',
  'Aya Zerouali', 'Othman Bennani', 'Houda Mekouar', 'Anas Lahlou', 'Sara Tazi'
];

const seedDatabase = () => {
  if (localStorage.getItem('users')) return; // Already seeded

  console.log('Seeding database with critical requirements...');
  
  const users: User[] = [];
  const matches: MatchRequest[] = [];
  const messages: Message[] = [];

  // Create Admin
  users.push({
    id: 'user_admin',
    email: 'admin@aui.ma',
    passwordHash: hashPassword('admin123'),
    fullName: 'Admin User',
    major: 'Staff',
    yearOfStudy: 'N/A',
    role: UserRole.ADMIN,
    purposes: [],
    interests: [],
    isVerified: true,
    reportsCount: 0,
    isBanned: false,
    createdAt: new Date().toISOString()
  });

  // Create 30 Students
  NAMES.forEach((name, idx) => {
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ')[1].toLowerCase();
    const email = `${firstName[0]}.${lastName}@aui.ma`;
    
    const purposes = [MatchPurpose.STUDY, MatchPurpose.GYM, MatchPurpose.HANGOUT, MatchPurpose.PROJECT]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    const interests = INTERESTS_LIST
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 3);

    users.push({
      id: `user_${idx}`,
      email: email,
      passwordHash: hashPassword('password123'),
      fullName: name,
      major: MAJORS[Math.floor(Math.random() * MAJORS.length)],
      yearOfStudy: YEARS[Math.floor(Math.random() * YEARS.length)],
      role: UserRole.STUDENT,
      purposes: purposes,
      interests: interests,
      bio: `Hi, I'm ${name.split(' ')[0]}! I love ${interests[0]} and I'm looking for a ${purposes[0]} buddy.`,
      isVerified: true,
      reportsCount: 0,
      isBanned: false,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
    });
  });

  setStorage('users', users);

  // Create 50 matches
  let matchCount = 0;
  let attempts = 0;
  
  while (matchCount < 50 && attempts < 1000) {
    attempts++;
    const u1Idx = Math.floor(Math.random() * 30) + 1;
    const u2Idx = Math.floor(Math.random() * 30) + 1;
    
    if (u1Idx === u2Idx) continue;
    
    const sender = users[u1Idx];
    const receiver = users[u2Idx];

    const exists = matches.some(m => 
        (m.senderId === sender.id && m.receiverId === receiver.id) ||
        (m.senderId === receiver.id && m.receiverId === sender.id)
    );

    if (exists) continue;

    const matchId = `match_${matchCount}`;
    const status = matchCount < 30 ? MatchStatus.ACCEPTED : MatchStatus.PENDING; 

    matches.push({
      id: matchId,
      senderId: sender.id,
      receiverId: receiver.id,
      purpose: sender.purposes[0] || MatchPurpose.HANGOUT,
      status: status, 
      aiReasoning: 'Matched based on shared interests in ' + sender.interests[0],
      createdAt: new Date().toISOString()
    });
    
    matchCount++;
  }

  setStorage('matches', matches);

  // Create 30 messages (Reduced from 80 to be less spammy)
  let messageCount = 0;
  const acceptedMatches = matches.filter(m => m.status === MatchStatus.ACCEPTED);
  
  if (acceptedMatches.length > 0) {
      while (messageCount < 30) {
          const match = acceptedMatches[messageCount % acceptedMatches.length];
          const isSender = Math.random() > 0.5;
          const fromId = isSender ? match.senderId : match.receiverId;
          
          messages.push({
            id: `msg_${messageCount}`,
            matchId: match.id,
            senderId: fromId,
            content: [
                "Hey! How's it going?",
                "Are you free to meet up?",
                "I'm studying at the library.",
                "Did you see the game last night?",
                "Let's grab coffee.",
                "Cool profile!",
                "What's your major?",
                "I need help with this project."
            ][Math.floor(Math.random() * 8)],
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
            read: true
          });
          messageCount++;
      }
  }

  setStorage('messages', messages);
  console.log('Database seeded successfully: 30 users, 50 matches, 30 messages.');
};

seedDatabase();

// --- USERS & AUTH ---

export const getUsers = (): User[] => getStorage('users', []);

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

const checkUserBanned = (userId: string) => {
    const user = getUserById(userId);
    if (!user || user.isBanned) throw new Error("This account is suspended.");
};

export const registerUser = (user: Omit<User, 'id' | 'createdAt' | 'reportsCount' | 'isBanned' | 'role' | 'isVerified' | 'passwordHash'>, password: string): User => {
  const users = getUsers();
  if (users.find(u => u.email === user.email)) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}`,
    passwordHash: hashPassword(password),
    role: UserRole.STUDENT,
    isVerified: true, 
    reportsCount: 0,
    isBanned: false,
    createdAt: new Date().toISOString()
  };
  
  // AUTO-CONNECT: Create 1 Accepted Match (with message) and 1 Pending Request for demo purposes
  const matches = getMatches();
  const messages = getStorage<Message[]>('messages', []);
  const existingUsers = users.filter(u => u.role === UserRole.STUDENT);

  if (existingUsers.length >= 2) {
    // 1. Create Accepted Match with User 0
    const buddy = existingUsers[0];
    const matchId = `match_new_${Date.now()}`;
    matches.push({
      id: matchId,
      senderId: buddy.id,
      receiverId: newUser.id,
      purpose: buddy.purposes[0] || MatchPurpose.HANGOUT,
      status: MatchStatus.ACCEPTED,
      aiReasoning: "We thought you'd get along nicely!",
      createdAt: new Date().toISOString()
    });
    // Send welcome message
    messages.push({
      id: `msg_new_${Date.now()}`,
      matchId: matchId,
      senderId: buddy.id,
      content: "Hey! Welcome to UniMates. I see you're new here!",
      timestamp: new Date().toISOString(),
      read: false
    });
    // Create Notification
    createNotification(newUser.id, 'New Message', "Hey! Welcome to UniMates...", matchId, 'MESSAGE');

    // 2. Create Pending Request from User 1
    const requester = existingUsers[1];
    const reqId = `match_req_${Date.now()}`;
    matches.push({
      id: reqId,
      senderId: requester.id,
      receiverId: newUser.id,
      purpose: MatchPurpose.STUDY,
      status: MatchStatus.PENDING,
      aiReasoning: "You both study similar majors.",
      createdAt: new Date().toISOString()
    });
    // Create Notification
    createNotification(newUser.id, 'New Match Request', `${requester.fullName} wants to match!`, reqId, 'MATCH_REQUEST');
  }

  users.push(newUser);
  setStorage('users', users);
  setStorage('matches', matches);
  setStorage('messages', messages);

  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) throw new Error('User not found.');
  if (user.passwordHash !== hashPassword(password)) throw new Error('Invalid password.');
  if (user.isBanned) throw new Error('This account has been suspended.');
  
  return user;
};

export const verifyPassword = (userId: string, password: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  return user.passwordHash === hashPassword(password);
};

export const resetPassword = (email: string) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (user) {
    console.log(`Password reset link sent to ${email}`);
    return true;
  }
  return false;
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User => {
  checkUserBanned(userId);
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  
  const updatedUser = { ...users[idx], ...updates };
  users[idx] = updatedUser;
  setStorage('users', users);
  return updatedUser;
};

export const banUser = (userId: string) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].isBanned = true;
    setStorage('users', users);
  }
};

export const unbanUser = (userId: string) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].isBanned = false;
    setStorage('users', users);
  }
};

// --- MATCHES ---

export const getMatches = (): MatchRequest[] => getStorage('matches', []);

export const sendMatchRequest = (senderId: string, receiverId: string, purpose: MatchPurpose, aiReasoning?: string) => {
  checkUserBanned(senderId);
  const matches = getMatches();
  const existing = matches.find(m => 
    (m.senderId === senderId && m.receiverId === receiverId) || 
    (m.senderId === receiverId && m.receiverId === senderId)
  );

  if (existing) throw new Error('Match request already exists');

  const newMatch: MatchRequest = {
    id: `match_${Date.now()}`,
    senderId,
    receiverId,
    purpose,
    status: MatchStatus.PENDING,
    aiReasoning,
    createdAt: new Date().toISOString()
  };

  matches.push(newMatch);
  setStorage('matches', matches);
  createNotification(receiverId, 'New Match Request', 'Someone wants to connect!', newMatch.id, 'MATCH_REQUEST');
};

export const updateMatchStatus = (matchId: string, status: MatchStatus) => {
  const matches = getMatches();
  const idx = matches.findIndex(m => m.id === matchId);
  if (idx === -1) return;

  matches[idx].status = status;
  setStorage('matches', matches);

  if (status === MatchStatus.ACCEPTED) {
    createNotification(matches[idx].senderId, 'It\'s a Match!', 'Your request was accepted.', matchId, 'MATCH_ACCEPTED');
  }
};

// --- MESSAGES ---

export const getMessages = (matchId: string): Message[] => {
  const allMessages = getStorage<Message[]>('messages', []);
  return allMessages.filter(m => m.matchId === matchId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendMessage = (matchId: string, senderId: string, content: string) => {
  checkUserBanned(senderId);
  const messages = getStorage<Message[]>('messages', []);
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    matchId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };
  messages.push(newMessage);
  setStorage('messages', messages);
  
  // Find receiver
  const matches = getMatches();
  const match = matches.find(m => m.id === matchId);
  if (match) {
    const receiverId = match.senderId === senderId ? match.receiverId : match.senderId;
    createNotification(receiverId, 'New Message', content.substring(0, 30) + (content.length > 30 ? '...' : ''), matchId, 'MESSAGE');
  }
};

// --- NOTIFICATIONS ---

export const getNotifications = (userId: string): Notification[] => {
  const all = getStorage<Notification[]>('notifications', []);
  return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getUnreadCounts = (userId: string) => {
  const notifs = getNotifications(userId);
  const unreadNotifs = notifs.filter(n => !n.read).length;
  return unreadNotifs;
};

export const markNotificationRead = (id: string) => {
  const notifications = getStorage<Notification[]>('notifications', []);
  const idx = notifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    notifications[idx].read = true;
    setStorage('notifications', notifications);
  }
};

export const markAllNotificationsRead = (userId: string) => {
    const notifications = getStorage<Notification[]>('notifications', []);
    notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
    });
    setStorage('notifications', notifications);
};

const createNotification = (userId: string, title: string, message: string, relatedId: string, type: Notification['type']) => {
  const notifications = getStorage<Notification[]>('notifications', []);
  notifications.push({
    id: `notif_${Date.now()}`,
    userId,
    title,
    message,
    relatedId,
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
  setStorage('notifications', notifications);
};

// --- DEMO SIMULATION ---

export const simulateIncomingMessage = (userId: string) => {
    const matches = getMatches().filter(m => (m.senderId === userId || m.receiverId === userId) && m.status === MatchStatus.ACCEPTED);
    if (matches.length === 0) return alert("You need a match first!");
    
    const randomMatch = matches[Math.floor(Math.random() * matches.length)];
    const partnerId = randomMatch.senderId === userId ? randomMatch.receiverId : randomMatch.senderId;
    
    sendMessage(randomMatch.id, partnerId, "Hey! This is a demo message to test notifications.");
};

export const simulateIncomingRequest = (userId: string) => {
    const users = getUsers().filter(u => u.id !== userId && u.role !== UserRole.ADMIN);
    // Find someone not matched
    const matches = getMatches();
    const available = users.find(u => !matches.some(m => (m.senderId === u.id && m.receiverId === userId) || (m.senderId === userId && m.receiverId === u.id)));
    
    if (available) {
        sendMatchRequest(available.id, userId, MatchPurpose.GYM, "Demo request generated!");
    } else {
        alert("Everyone is already matched with you!");
    }
};

// --- REPORTS & ADMIN ---

export const reportUser = (reporterId: string, reportedUserId: string, reason: string, description: string, passwordConfirm: string) => {
  const isPasswordValid = verifyPassword(reporterId, passwordConfirm);
  if (!isPasswordValid) throw new Error('Incorrect password. Report validation failed.');

  const reports = getStorage<Report[]>('reports', []);
  reports.push({
    id: `rep_${Date.now()}`,
    reporterId,
    reportedUserId,
    reason,
    description,
    timestamp: new Date().toISOString(),
    status: ReportStatus.PENDING
  });
  setStorage('reports', reports);
  
  const users = getUsers();
  const reportedUserIdx = users.findIndex(u => u.id === reportedUserId);
  if (reportedUserIdx !== -1) {
    users[reportedUserIdx].reportsCount += 1;
    if (users[reportedUserIdx].reportsCount >= 5) {
      users[reportedUserIdx].isBanned = true;
    }
    setStorage('users', users);
  }
};

export const getAllReports = (): Report[] => getStorage('reports', []);

export const getReportsForUser = (userId: string): Report[] => {
    const reports = getAllReports();
    return reports.filter(r => r.reportedUserId === userId);
};

export const updateReportStatus = (reportId: string, status: ReportStatus) => {
  const reports = getAllReports();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    reports[idx].status = status;
    setStorage('reports', reports);
  }
};