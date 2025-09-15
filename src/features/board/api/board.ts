import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';
import type { List, BoardWithListsAndTasks, CreateListRequest } from '@/types';
import { getErrorMessage } from '@/utils/errorHandler';

export const boardApi = {
  async getBoardWithListsAndTasks(
    boardId: string
  ): Promise<BoardWithListsAndTasks> {
    try {
      const response = await httpClient.get(`${API_ROUTES.BOARDS}/${boardId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createList(boardId: string, data: CreateListRequest): Promise<List> {
    try {
      const response = await httpClient.post(
        `${API_ROUTES.BOARDS}/${boardId}${API_ROUTES.LISTS}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
