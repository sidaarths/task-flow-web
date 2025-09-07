'use client';

import { API_URL, API_ROUTES } from '@/config/apiConfig';

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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${API_ROUTES.BOARDS}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch boards');
    }

    return response.json();
  },

  async createBoard(data: CreateBoardRequest): Promise<Board> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${API_ROUTES.BOARDS}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create board');
    }

    return response.json();
  },

  async updateBoard(boardId: string, data: UpdateBoardRequest): Promise<Board> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${API_ROUTES.BOARDS}/${boardId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update board');
    }

    return response.json();
  },

  async deleteBoard(boardId: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${API_ROUTES.BOARDS}/${boardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete board');
    }
  },
};
