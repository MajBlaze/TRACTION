import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  getUserForSession,
  updateUserData,
  getUserData,
} from '@/lib/local-auth/server';
import type { AppData } from '@/lib/local-auth/types';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getUserForSession(token);
}

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const data = await getUserData(user.id);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { data } = (await request.json()) as { data?: AppData };

  if (!data) {
    return NextResponse.json({ error: 'Missing app data.' }, { status: 400 });
  }

  const updatedData = await updateUserData(user.id, data);
  return NextResponse.json({ data: updatedData });
}
