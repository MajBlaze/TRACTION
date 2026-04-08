export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  members: string[];
}

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  isReminder: boolean;
  isCompleted: boolean;
}

export interface AppData {
  expenses: Expense[];
  groups: Group[];
  tasks: Task[];
  budget: number;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface StoredUser extends PublicUser {
  passwordHash?: string;
  authProvider?: 'local' | 'google';
  appData: AppData;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface AuthStore {
  users: StoredUser[];
  sessions: SessionRecord[];
}
