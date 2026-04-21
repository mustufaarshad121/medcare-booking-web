export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_VALUE = 'authenticated';

export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}
