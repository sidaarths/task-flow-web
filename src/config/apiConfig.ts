import { isDev } from './env';

// Prefer NEXT_PUBLIC_API_URL env var (set in Vercel dashboard / .env.local).
// Falls back to localhost in dev and the production Render URL otherwise.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (isDev ? 'http://localhost:3001/api/v1' : 'https://task-flow-api-alpha.onrender.com/api/v1');

export const API_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DEMO: '/auth/demo',
  USER_PROFILE: '/users/me',
  BOARDS: '/boards',
  USERS: '/users',
  TASKS: '/tasks',
  LISTS: '/lists',
  SSE: '/sse',
};
