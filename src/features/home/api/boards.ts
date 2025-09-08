'use client';

import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';

export interface Board {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  title: string;
  description: string;
}

export interface UpdateBoardRequest {
  title?: string;
  description?: string;
}

export const boardsApi = {
  async getBoards(): Promise<Board[]> {
    try {
      const response = await httpClient.get(API_ROUTES.BOARDS);
      return response.data;
    } catch {
      throw new Error('Failed to fetch boards');
    }
  },

  async createBoard(data: CreateBoardRequest): Promise<Board> {
    try {
      const response = await httpClient.post(API_ROUTES.BOARDS, data);
      return response.data;
    } catch {
      throw new Error('Failed to create board');
    }
  },

  async updateBoard(boardId: string, data: UpdateBoardRequest): Promise<Board> {
    try {
      const response = await httpClient.put(
        `${API_ROUTES.BOARDS}/${boardId}`,
        data
      );
      return response.data;
    } catch {
      throw new Error('Failed to update board');
    }
  },

  async deleteBoard(boardId: string): Promise<void> {
    try {
      await httpClient.delete(`${API_ROUTES.BOARDS}/${boardId}`);
    } catch {
      throw new Error('Failed to delete board');
    }
  },
};
