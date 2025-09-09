import httpClient from '@/config/httpClient';
import { Task, UpdateTaskRequest } from '@/types';
import { API_ROUTES } from '@/config/apiConfig';

export const taskApi = {
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.put(`${API_ROUTES.TASKS}/${taskId}`, data);
      return response.data;
    } catch {
      throw new Error('Failed to update task');
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await httpClient.delete(`${API_ROUTES.TASKS}/${taskId}`);
    } catch {
      throw new Error('Failed to delete task');
    }
  },
};
