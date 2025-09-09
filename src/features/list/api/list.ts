import httpClient from '@/config/httpClient';
import { List, Task, UpdateListRequest, CreateTaskRequest } from '@/types';

export const listApi = {
  async updateList(listId: string, data: UpdateListRequest): Promise<List> {
    try {
      const response = await httpClient.put(`/lists/${listId}`, data);
      return response.data;
    } catch {
      throw new Error('Failed to update list');
    }
  },

  async deleteList(listId: string): Promise<void> {
    try {
      await httpClient.delete(`/lists/${listId}`);
    } catch {
      throw new Error('Failed to delete list');
    }
  },

  async createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.post(`/lists/${listId}/tasks`, data);
      return response.data;
    } catch {
      throw new Error('Failed to create task');
    }
  },
};
