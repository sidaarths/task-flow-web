import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '@/types';
import { getErrorMessage } from '@/utils/errorHandler';

export const boardsApi = {
  async getBoards(): Promise<Board[]> {
    try {
      const response = await httpClient.get(API_ROUTES.BOARDS);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createBoard(data: CreateBoardRequest): Promise<Board> {
    try {
      const response = await httpClient.post(API_ROUTES.BOARDS, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateBoard(boardId: string, data: UpdateBoardRequest): Promise<Board> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.BOARDS}/${boardId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteBoard(boardId: string): Promise<void> {
    try {
      await httpClient.delete(`${API_ROUTES.BOARDS}/${boardId}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
