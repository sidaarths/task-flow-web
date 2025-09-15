import httpClient from '@/config/httpClient';
import { Task, UpdateTaskRequest } from '@/types';
import { API_ROUTES } from '@/config/apiConfig';

export const taskApi = {
  async getTask(taskId: string): Promise<Task> {
    try {
      const response = await httpClient.get(`${API_ROUTES.TASKS}/${taskId}`);
      return response.data;
    } catch {
      throw new Error('Failed to fetch task');
    }
  },

  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.TASKS}/${taskId}`,
        data
      );
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

  async assignUser(taskId: string, userId: string): Promise<Task> {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.TASKS}/${taskId}/users/${userId}`
      );
      return response.data;
    } catch {
      throw new Error('Failed to assign user to task');
    }
  },

  async unassignUser(taskId: string, userId: string): Promise<Task> {
    try {
      const response = await httpClient.delete(
        `${API_ROUTES.TASKS}/${taskId}/users/${userId}`
      );
      return response.data;
    } catch {
      throw new Error('Failed to unassign user from task');
    }
  },

  async moveTask(taskId: string, listId: string): Promise<Task> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.TASKS}/${taskId}/lists/${listId}`
      );
      return response.data;
    } catch {
      throw new Error('Failed to move task');
    }
  },

  async updateTaskPosition(
    taskId: string,
    position: number,
    listId?: string
  ): Promise<void> {
    try {
      await httpClient.put(`${API_ROUTES.TASKS}/${taskId}/position`, {
        position,
        listId,
      });
    } catch {
      throw new Error('Failed to update task position');
    }
  },
};
