import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';
import type { List, BoardWithListsAndTasks, CreateListRequest } from '@/types';

export const boardApi = {
  async getBoardWithListsAndTasks(
    boardId: string
  ): Promise<BoardWithListsAndTasks> {
    try {
      const response = await httpClient.get(`${API_ROUTES.BOARDS}/${boardId}`);
      return response.data;
    } catch {
      throw new Error('Failed to fetch board details');
    }
  },

  async createList(boardId: string, data: CreateListRequest): Promise<List> {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.BOARDS}/${boardId}/lists`,
        data
      );
      return response.data;
    } catch {
      throw new Error('Failed to create list');
    }
  },
};
