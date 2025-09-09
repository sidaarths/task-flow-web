import httpClient from '@/config/httpClient';
import { Task, UpdateTaskRequest } from '@/types';

export const taskApi = {
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.put(`/tasks/${taskId}`, data);
      return response.data;
    } catch {
      throw new Error('Failed to update task');
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await httpClient.delete(`/tasks/${taskId}`);
    } catch {
      throw new Error('Failed to delete task');
    }
  },
};
