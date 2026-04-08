import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AppData, AuthStore, PublicUser, StoredUser } from './types';
import { defaultAppData } from './defaults';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'traction-users.json');

export const SESSION_COOKIE_NAME = 'traction_session';

async function ensureStoreFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, 'utf8');
  } catch {
    const initialStore: AuthStore = {
      users: [],
      sessions: [],
    };

    await writeFile(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
  }
}

async function readStore(): Promise<AuthStore> {
  await ensureStoreFile();
  const raw = await readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw) as AuthStore;
}

async function writeStore(store: AuthStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(':');
  const candidateHash = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, 'hex');

  return timingSafeEqual(originalBuffer, candidateHash);
}

function sanitizeUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function createUser(input: {
  username: string;
  email: string;
  password: string;
}) {
  const store = await readStore();
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim();

  if (store.users.some(user => user.email === email)) {
    throw new Error('An account with this email already exists.');
  }

  const user: StoredUser = {
    id: randomBytes(16).toString('hex'),
    username,
    email,
    createdAt: new Date().toISOString(),
    passwordHash: createPasswordHash(input.password),
    authProvider: 'local',
    appData: defaultAppData(),
  };

  store.users.push(user);
  await writeStore(store);

  return sanitizeUser(user);
}

export async function authenticateUser(email: string, password: string) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  const user = store.users.find(entry => entry.email === normalizedEmail);

  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid email or password.');
  }

  return sanitizeUser(user);
}

export async function findOrCreateGoogleUser(input: {
  email: string;
  username: string;
}) {
  const store = await readStore();
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim() || email.split('@')[0] || 'Google User';

  const existingUser = store.users.find(user => user.email === email);

  if (existingUser) {
    if (!existingUser.authProvider) {
      existingUser.authProvider = existingUser.passwordHash ? 'local' : 'google';
    }

    if (!existingUser.username?.trim()) {
      existingUser.username = username;
    }

    await writeStore(store);
    return sanitizeUser(existingUser);
  }

  const user: StoredUser = {
    id: randomBytes(16).toString('hex'),
    username,
    email,
    createdAt: new Date().toISOString(),
    authProvider: 'google',
    appData: defaultAppData(),
  };

  store.users.push(user);
  await writeStore(store);

  return sanitizeUser(user);
}

export async function createSession(userId: string) {
  const store = await readStore();
  const token = randomBytes(32).toString('hex');

  store.sessions = store.sessions.filter(session => session.userId !== userId);
  store.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });

  await writeStore(store);

  return token;
}

export async function getUserForSession(token: string | undefined) {
  if (!token) {
    return null;
  }

  const store = await readStore();
  const session = store.sessions.find(entry => entry.token === token);

  if (!session) {
    return null;
  }

  const user = store.users.find(entry => entry.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

export async function clearSession(token: string | undefined) {
  if (!token) {
    return;
  }

  const store = await readStore();
  const nextSessions = store.sessions.filter(session => session.token !== token);

  if (nextSessions.length !== store.sessions.length) {
    store.sessions = nextSessions;
    await writeStore(store);
  }
}

export async function getUserData(userId: string) {
  const store = await readStore();
  const user = store.users.find(entry => entry.id === userId);
  return user?.appData ?? defaultAppData();
}

export async function updateUserData(userId: string, appData: AppData) {
  const store = await readStore();
  const user = store.users.find(entry => entry.id === userId);

  if (!user) {
    throw new Error('User not found.');
  }

  user.appData = appData;
  await writeStore(store);
  return user.appData;
}
