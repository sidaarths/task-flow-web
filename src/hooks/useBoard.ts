import { useQuery, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/features/board/api/board';
import type { BoardWithListsAndTasks, List, Task } from '@/types';

export const boardQueryKeys = {
  all: ['board'] as const,
  detail: (boardId: string) => [...boardQueryKeys.all, boardId] as const,
};

export const useBoardDetail = (boardId: string) =>
  useQuery({
    queryKey: boardQueryKeys.detail(boardId),
    queryFn: () => boardApi.getBoardWithListsAndTasks(boardId),
    enabled: !!boardId,
  });

// Helper for SSE updates — surgical cache writes
export const useBoardCacheUpdater = (boardId: string) => {
  const qc = useQueryClient();
  const key = boardQueryKeys.detail(boardId);

  return {
    addList: (list: List) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old ? { ...old, lists: [...old.lists, list] } : old
      ),
    updateList: (list: List) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old ? { ...old, lists: old.lists.map((l) => (l._id === list._id ? list : l)) } : old
      ),
    removeList: (listId: string) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old
          ? {
              ...old,
              lists: old.lists.filter((l) => l._id !== listId),
              tasks: old.tasks.filter((t) => t.listId !== listId),
            }
          : old
      ),
    addTask: (task: Task) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old ? { ...old, tasks: [...old.tasks, task] } : old
      ),
    updateTask: (task: Task) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old ? { ...old, tasks: old.tasks.map((t) => (t._id === task._id ? task : t)) } : old
      ),
    removeTask: (taskId: string) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old ? { ...old, tasks: old.tasks.filter((t) => t._id !== taskId) } : old
      ),
    reorderLists: (updates: Array<{ _id: string; position: number }>) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old
          ? {
              ...old,
              lists: old.lists.map((l) => {
                const u = updates.find((x) => x._id === l._id);
                return u ? { ...l, position: u.position } : l;
              }),
            }
          : old
      ),
    reorderTasks: (updates: Array<{ _id: string; position: number; listId: string }>) =>
      qc.setQueryData(key, (old: BoardWithListsAndTasks | undefined) =>
        old
          ? {
              ...old,
              tasks: old.tasks.map((t) => {
                const u = updates.find((x) => x._id === t._id);
                return u ? { ...t, position: u.position, listId: u.listId } : t;
              }),
            }
          : old
      ),
    invalidate: () => qc.invalidateQueries({ queryKey: key }),
  };
};
