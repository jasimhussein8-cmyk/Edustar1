
// Mock storage service to replace Firebase
const STORAGE_KEYS = {
  USERS: 'app_users',
  SUBJECTS: 'app_subjects',
  LESSONS: 'app_lessons',
  EXAMS: 'app_exams',
  QUESTIONS: 'app_questions',
  PROGRESS: 'app_progress',
  RECOMMENDATIONS: 'app_recommendations',
  FAVORITES: 'app_favorites',
  NOTIFICATIONS: 'app_notifications',
  MESSAGES: 'app_messages',
  ASSIGNMENTS: 'app_assignments',
  SUBMISSIONS: 'app_submissions',
  REWARDS: 'app_rewards',
  USER_REWARDS: 'app_user_rewards',
  BADGES: 'app_badges',
  PAYMENTS: 'app_payments',
  NOTES: 'app_notes'
};

const getLocalData = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocalData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockDb = {
  collection: (name: string) => {
    return {
      get: async () => getLocalData(name),
      add: async (data: any) => {
        const items = getLocalData(name);
        const newItem = { ...data, id: Math.random().toString(36).substr(2, 9) };
        setLocalData(name, [...items, newItem]);
        return newItem;
      },
      update: async (id: string, data: any) => {
        const items = getLocalData(name);
        const updated = items.map((item: any) => item.id === id ? { ...item, ...data } : item);
        setLocalData(name, updated);
      },
      delete: async (id: string) => {
        const items = getLocalData(name);
        setLocalData(name, items.filter((item: any) => item.id !== id));
      }
    };
  }
};

export const mockAuth = {
  currentUser: null as any,
  onAuthStateChanged: (callback: any) => {
    const user = JSON.parse(localStorage.getItem('current_user') || 'null');
    mockAuth.currentUser = user;
    callback(user);
    return () => {};
  },
  signIn: async (email: string, pass: string) => {
    const users = getLocalData(STORAGE_KEYS.USERS);
    const user = users.find((u: any) => u.username === email && u.password === pass);
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));
      mockAuth.currentUser = user;
      return { user };
    }
    throw new Error('Invalid credentials');
  },
  signUp: async (userData: any) => {
    const users = getLocalData(STORAGE_KEYS.USERS);
    const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9) };
    setLocalData(STORAGE_KEYS.USERS, [...users, newUser]);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    mockAuth.currentUser = newUser;
    return { user: newUser };
  },
  signOut: async () => {
    localStorage.removeItem('current_user');
    mockAuth.currentUser = null;
  }
};
