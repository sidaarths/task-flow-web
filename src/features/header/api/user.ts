import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';

export interface User {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await httpClient.get(API_ROUTES.USER_PROFILE);
    return response.data;
  } catch {
    throw new Error('Failed to fetch user profile');
  }
};
