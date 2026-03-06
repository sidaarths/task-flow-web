import { isDev } from './env';

export const API_URL = isDev
  ? 'http://localhost:3001/api/v1'
  : 'https://task-flow-api-alpha.onrender.com/api/v1';

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
