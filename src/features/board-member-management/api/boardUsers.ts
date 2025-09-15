import { API_ROUTES } from '@/config/apiConfig';
import httpClient from '@/config/httpClient';
import type { User } from '@/types';
import { getUserById } from '@/api/user';

export const boardApi = {
  async inviteUserToBoard(boardId: string, userId: string): Promise<void> {
    try {
      await httpClient.post(`${API_ROUTES.BOARDS}/${boardId}/users/${userId}`);
    } catch {
      throw new Error('Failed to invite user to board');
    }
  },

  async removeMemberFromBoard(boardId: string, userId: string): Promise<void> {
    try {
      await httpClient.delete(
        `${API_ROUTES.BOARDS}/${boardId}/users/${userId}`
      );
    } catch {
      throw new Error('Failed to remove member from board');
    }
  },

  async getBoardMembers(memberIds: string[]): Promise<User[]> {
    try {
      const members: User[] = [];
      for (const id of memberIds) {
        try {
          const member = await getUserById(id);
          members.push(member);
        } catch (error) {
          console.warn(`Failed to fetch user ${id}:`, error);
        }
      }

      return members;
    } catch {
      throw new Error('Failed to fetch board members');
    }
  },
};
