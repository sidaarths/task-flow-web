import { isDev } from './env';

export const API_URL = isDev
  ? 'http://localhost:3001/api'
  : `${process.env.API_URL}/api` || 'https://task-flow-api-alpha.vercel.app/api';

export const SOCKET_URL = isDev
  ? 'http://localhost:3001'
  : process.env.API_URL || 'https://task-flow-api-alpha.vercel.app';

export const API_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  USER_PROFILE: '/users/me',
  BOARDS: '/boards',
  USERS: '/users',
  TASKS: '/tasks',
  LISTS: '/lists',
};
