import httpClient from '@/config/httpClient';
import { List, Task, UpdateListRequest, CreateTaskRequest } from '@/types';
import { API_ROUTES } from '@/config/apiConfig';
import { getErrorMessage } from '@/utils/errorHandler';

export const listApi = {
  async updateList(listId: string, data: UpdateListRequest): Promise<List> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.LISTS}/${listId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteList(listId: string): Promise<void> {
    try {
      await httpClient.delete(`${API_ROUTES.LISTS}/${listId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.LISTS}/${listId}${API_ROUTES.TASKS}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getTasks(listId: string): Promise<Task[]> {
    try {
      const response = await httpClient.get(
        `${API_ROUTES.LISTS}/${listId}${API_ROUTES.TASKS}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
