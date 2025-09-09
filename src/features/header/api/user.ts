import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';
import type { User } from '@/types';

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await httpClient.get(API_ROUTES.USER_PROFILE);
    return response.data;
  } catch {
    throw new Error('Failed to fetch user profile');
  }
};
