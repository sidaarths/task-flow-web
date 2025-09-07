import axios from 'axios';
import { API_URL, API_ROUTES } from '@/config/apiConfig';

interface RegisterCredentials {
  email: string;
  password: string;
}

export const registerUser = async (credentials: RegisterCredentials) => {
  try {
    const auth = btoa(`${credentials.email}:${credentials.password}`);
    const response = await axios.post(
      `${API_URL}${API_ROUTES.REGISTER}`,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
