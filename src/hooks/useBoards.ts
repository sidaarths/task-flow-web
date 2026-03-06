import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/features/home/api/boards';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '@/types';

export const boardsQueryKeys = {
  all: ['boards'] as const,
  list: () => [...boardsQueryKeys.all, 'list'] as const,
};

export const useBoards = () =>
  useQuery({
    queryKey: boardsQueryKeys.list(),
    queryFn: boardsApi.getBoards,
  });

export const useCreateBoard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardsApi.createBoard(data),
    onSuccess: (newBoard) => {
      qc.setQueryData(boardsQueryKeys.list(), (old: Board[] = []) => [newBoard, ...old]);
    },
  });
};

export const useUpdateBoard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, data }: { boardId: string; data: UpdateBoardRequest }) =>
      boardsApi.updateBoard(boardId, data),
    onSuccess: (updated) => {
      qc.setQueryData(boardsQueryKeys.list(), (old: Board[] = []) =>
        old.map((b) => (b._id === updated._id ? updated : b))
      );
    },
  });
};

export const useDeleteBoard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.deleteBoard(boardId),
    onSuccess: (_, boardId) => {
      qc.setQueryData(boardsQueryKeys.list(), (old: Board[] = []) =>
        old.filter((b) => b._id !== boardId)
      );
    },
  });
};
