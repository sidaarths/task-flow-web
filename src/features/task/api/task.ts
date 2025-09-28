import httpClient from '@/config/httpClient';
import { Task, UpdateTaskRequest } from '@/types';
import { API_ROUTES } from '@/config/apiConfig';
import { getErrorMessage } from '@/utils/errorHandler';

export const taskApi = {
  async getTask(taskId: string): Promise<Task> {
    try {
      const response = await httpClient.get(`${API_ROUTES.TASKS}/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.TASKS}/${taskId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      await httpClient.delete(`${API_ROUTES.TASKS}/${taskId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async assignUser(taskId: string, userId: string): Promise<Task> {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.TASKS}/${taskId}/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async unassignUser(taskId: string, userId: string): Promise<Task> {
    try {
      const response = await httpClient.delete(
        `${API_ROUTES.TASKS}/${taskId}/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
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
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
