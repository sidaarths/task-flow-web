import axios from 'axios';
import { API_ROUTES, API_URL } from '@/config/apiConfig';

export interface User {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const getUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await axios.get(`${API_URL}${API_ROUTES.USER_PROFILE}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
