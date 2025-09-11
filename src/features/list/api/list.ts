import httpClient from '@/config/httpClient';
import { List, Task, UpdateListRequest, CreateTaskRequest } from '@/types';
import { API_ROUTES } from '@/config/apiConfig';

export const listApi = {
  async updateList(listId: string, data: UpdateListRequest): Promise<List> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.LISTS}/${listId}`,
        data
      );
      return response.data;
    } catch {
      throw new Error('Failed to update list');
    }
  },

  async deleteList(listId: string): Promise<void> {
    try {
      await httpClient.delete(`${API_ROUTES.LISTS}/${listId}`);
    } catch {
      throw new Error('Failed to delete list');
    }
  },

  async createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.LISTS}/${listId}${API_ROUTES.TASKS}`,
        data
      );
      return response.data;
    } catch {
      throw new Error('Failed to create task');
    }
  },
};
