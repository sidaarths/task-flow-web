'use client';

import { useEffect, useRef } from 'react';
import { API_URL, API_ROUTES } from '@/config/apiConfig';
import { useBoardCacheUpdater } from './useBoard';
import type { List, Task, Board } from '@/types';

type SSEEventData = {
  'list:created': List;
  'list:updated': List;
  'list:deleted': { listId: string };
  'list:reordered': Array<{ _id: string; position: number }>;
  'task:created': Task;
  'task:updated': Task;
  'task:deleted': { taskId: string };
  'task:reordered': Array<{ _id: string; position: number; listId: string }>;
  'board:updated': Board;
  'board:member-added': { userId: string };
  'board:member-removed': { userId: string };
};

export const useSSE = (boardId: string | null) => {
  const updater = useBoardCacheUpdater(boardId ?? '');
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.warn('[SSE] No auth token found — real-time updates will not be available.');
      return;
    }

    const url = `${API_URL}${API_ROUTES.SSE}/boards/${boardId}?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    const addListener = <K extends keyof SSEEventData>(
      event: K,
      handler: (data: SSEEventData[K]) => void
    ) => {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          handler(JSON.parse(e.data) as SSEEventData[K]);
        } catch {
          console.error(`[SSE] Failed to parse ${event} event`, e.data);
        }
      });
    };

    addListener('list:created', updater.addList);
    addListener('list:updated', updater.updateList);
    addListener('list:deleted', ({ listId }) => updater.removeList(listId));
    addListener('list:reordered', (lists) => updater.reorderLists(lists));
    addListener('task:created', updater.addTask);
    addListener('task:updated', updater.updateTask);
    addListener('task:deleted', ({ taskId }) => updater.removeTask(taskId));
    addListener('task:reordered', (tasks) => updater.reorderTasks(tasks));
    addListener('board:updated', () => updater.invalidate());
    addListener('board:member-added', () => updater.invalidate());
    addListener('board:member-removed', () => updater.invalidate());

    es.addEventListener('error', () => {
      // EventSource auto-reconnects — no manual retry needed
    });

    return () => {
      es.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);
};
