import axios from 'axios';
import { API_URL, API_ROUTES } from '@/config/apiConfig';

interface LoginCredentials {
  email: string;
  password: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const auth = btoa(`${credentials.email}:${credentials.password}`);
    const response = await axios.post(
      `${API_URL}${API_ROUTES.LOGIN}`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
