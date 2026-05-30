import { adminAuth } from './firebase-admin';
import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';

export async function verifyUser(request: NextRequest): Promise<DecodedIdToken | null> {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return await adminAuth.verifyIdToken(header.slice(7));
  } catch {
    return null;
  }
}
