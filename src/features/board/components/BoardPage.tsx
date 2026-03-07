'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  IconPlus,
  IconArrowLeft,
  IconUsers,
  IconAlertTriangle,
  IconClipboardList,
  IconUserPlus,
} from '@tabler/icons-react';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { List, Task } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useBoardDetail, useBoardCacheUpdater } from '@/hooks/useBoard';
import { useSSE } from '@/hooks/useSSE';
import { useUIStore } from '@/stores/uiStore';
import { boardApi } from '@/features/board/api/board';
import { listApi } from '@/features/list/api/list';
import {
  InviteUsersModal,
  BoardMembersModal,
} from '@/features/board-member-management';
import ListCard, { CreateListModal, EditListModal, DeleteListModal } from '@/features/list';
import TaskSidePanel from '@/features/task/components/TaskSidePanel';
import { Button } from '@/components/ui/Button';
import { DotPattern } from '@/components/magicui/dot-pattern';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const boardId = params.boardId as string;
  const searchQuery = searchParams.get('query') || '';

  const { data: boardData, isLoading, isError, error, refetch } = useBoardDetail(boardId);
  useSSE(boardId);
  const updater = useBoardCacheUpdater(boardId);

  const {
    showCreateListModal,
    showEditListModal,
    showDeleteListModal,
    showInviteUsersModal,
    showBoardMembersModal,
    selectedList,
    selectedTask,
    activeTask,
    openModal,
    closeModal,
    setSelectedList,
    setSelectedTask,
    setActiveTask,
  } = useUIStore();

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── List CRUD ──────────────────────────────────────────────────────────────
  const handleCreateList = async (title: string) => {
    try {
      setIsCreatingList(true);
      await boardApi.createList(boardId, { title });
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleEditList = (list: List) => {
    setSelectedList(list);
    openModal('showEditListModal');
  };

  const handleUpdateList = async (listId: string, title: string) => {
    try {
      setIsUpdatingList(true);
      await listApi.updateList(listId, { title });
    } finally {
      setIsUpdatingList(false);
    }
  };

  const handleDeleteList = (list: List) => {
    setSelectedList(list);
    openModal('showDeleteListModal');
  };

  const handleConfirmDeleteList = async (listId: string) => {
    try {
      setIsDeletingList(true);
      await listApi.deleteList(listId);
    } finally {
      setIsDeletingList(false);
    }
  };

  // ── List reordering ────────────────────────────────────────────────────────
  const handleMoveList = async (listId: string, direction: 'left' | 'right') => {
    if (!boardData) return;
    const sorted = [...boardData.lists].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((l) => l._id === listId);
    if (idx === -1) return;
    const newIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const swapped = [...sorted];
    [swapped[idx], swapped[newIdx]] = [swapped[newIdx], swapped[idx]];
    updater.reorderLists(swapped.map((l, i) => ({ _id: l._id, position: i })));
    try {
      await listApi.updateListPosition(listId, newIdx);
    } catch {
      updater.invalidate();
    }
  };

  // ── Task DnD ───────────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const task = boardData?.tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !boardData) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const draggedTask = boardData.tasks.find((t) => t._id === activeId);
    if (!draggedTask) return;

    let targetListId: string;
    let targetPosition: number;

    if (overId.startsWith('list-')) {
      targetListId = overId.replace('list-', '');
      targetPosition = boardData.tasks.filter((t) => t.listId === targetListId).length;
    } else {
      const targetTask = boardData.tasks.find((t) => t._id === overId);
      if (!targetTask) return;
      targetListId = targetTask.listId;
      const tasksInList = boardData.tasks
        .filter((t) => t.listId === targetListId)
        .sort((a, b) => a.position - b.position);
      targetPosition = tasksInList.findIndex((t) => t._id === overId);
    }

    if (draggedTask.listId === targetListId && draggedTask.position === targetPosition) return;
    updater.updateTask({ ...draggedTask, listId: targetListId, position: targetPosition });
    try {
      const { taskApi } = await import('@/features/task/api/task');
      await taskApi.updateTaskPosition(activeId, targetPosition, targetListId);
    } catch {
      updater.invalidate();
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const { sortedLists, getTasksForList, getTotalTasksForList } = useMemo(() => {
    const getTasksForListFn = (listId: string): Task[] => {
      if (!boardData?.tasks) return [];
      let tasks = boardData.tasks.filter((t) => t.listId === listId);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.labels?.some((l) => l.toLowerCase().includes(q))
        );
      }
      return tasks;
    };
    const getTotalFn = (listId: string) =>
      boardData?.tasks ? boardData.tasks.filter((t) => t.listId === listId).length : 0;
    const sorted = boardData?.lists
      ? [...boardData.lists].sort((a, b) => a.position - b.position)
      : [];
    return { sortedLists: sorted, getTasksForList: getTasksForListFn, getTotalTasksForList: getTotalFn };
  }, [boardData?.lists, boardData?.tasks, searchQuery]);

  const panelTask = selectedTask
    ? (boardData?.tasks.find((t) => t._id === selectedTask._id) ?? null)
    : null;
  const panelListTitle = panelTask
    ? (sortedLists.find((l) => l._id === panelTask.listId)?.title ?? '')
    : '';

  useEffect(() => {
    if (selectedTask && !panelTask) setSelectedTask(null);
  }, [panelTask, selectedTask, setSelectedTask]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading board…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-md space-y-4 p-6 text-center">
          <IconAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Failed to Load Board</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => refetch()}>Try Again</Button>
            <Button variant="secondary" onClick={() => router.push('/home')}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!boardData) return null;

  const isOwner = currentUser && boardData.board.createdBy === currentUser._id;
  const memberDetails = boardData.memberDetails ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Board header */}
      <div className="border-b border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left: back + board title */}
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/home')}
                aria-label="Back to boards"
                className="shrink-0 px-2"
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                  {boardData.board.title}
                </h1>
                {boardData.board.description && (
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                    {boardData.board.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openModal('showBoardMembersModal')}
                title="View board members"
              >
                <IconUsers className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {boardData.board.members.length} member
                  {boardData.board.members.length !== 1 ? 's' : ''}
                </span>
              </Button>

              {isOwner && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openModal('showInviteUsersModal')}
                >
                  <IconUserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Invite</span>
                </Button>
              )}

              <Button size="sm" onClick={() => openModal('showCreateListModal')}>
                <IconPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add List</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Board content — horizontal scroll */}
      <div className="flex-1 overflow-x-auto p-5">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {sortedLists.length === 0 ? (
            <div className="relative flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center dark:border-gray-700 dark:bg-gray-800/50">
              <DotPattern className="text-gray-200 dark:text-gray-700" cr={0.8} />
              <div className="relative z-10 flex flex-col items-center gap-4 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <IconClipboardList className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                    No lists yet
                  </h3>
                  <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                    Create your first list to start organizing tasks on this board.
                  </p>
                </div>
                <Button onClick={() => openModal('showCreateListModal')}>
                  <IconPlus className="h-4 w-4" />
                  Create Your First List
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 pb-4" style={{ width: 'max-content' }}>
              {sortedLists.map((list, idx) => (
                <ListCard
                  key={list._id}
                  list={list}
                  tasks={getTasksForList(list._id)}
                  onEditList={handleEditList}
                  onDeleteList={handleDeleteList}
                  onMoveLeft={() => handleMoveList(list._id, 'left')}
                  onMoveRight={() => handleMoveList(list._id, 'right')}
                  canMoveLeft={idx > 0}
                  canMoveRight={idx < sortedLists.length - 1}
                  onOpenTask={setSelectedTask}
                  searchQuery={searchQuery}
                  totalTasksInList={getTotalTasksForList(list._id)}
                />
              ))}
            </div>
          )}

          <DragOverlay>
            {activeTask ? (
              <div className="w-72 rotate-1 rounded-lg border-2 border-blue-500 bg-white p-3 opacity-90 shadow-xl dark:bg-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeTask.title}
                </p>
                {activeTask.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {activeTask.description}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task side panel */}
      <TaskSidePanel
        task={panelTask}
        isOpen={!!panelTask}
        onClose={() => setSelectedTask(null)}
        boardMembers={memberDetails}
        listTitle={panelListTitle}
        boardId={boardId}
      />

      {/* List modals */}
      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => closeModal('showCreateListModal')}
        onSubmit={handleCreateList}
        isLoading={isCreatingList}
      />
      <EditListModal
        isOpen={showEditListModal}
        onClose={() => { closeModal('showEditListModal'); setSelectedList(null); }}
        onSubmit={handleUpdateList}
        list={selectedList}
        isLoading={isUpdatingList}
      />
      <DeleteListModal
        isOpen={showDeleteListModal}
        onClose={() => { closeModal('showDeleteListModal'); setSelectedList(null); }}
        onConfirm={handleConfirmDeleteList}
        list={selectedList}
        isLoading={isDeletingList}
      />
      {isOwner && (
        <InviteUsersModal
          isOpen={showInviteUsersModal}
          onClose={() => closeModal('showInviteUsersModal')}
          boardId={boardId}
          existingMemberIds={boardData.board.members}
        />
      )}
      <BoardMembersModal
        isOpen={showBoardMembersModal}
        onClose={() => closeModal('showBoardMembersModal')}
        board={boardData.board}
      />
    </div>
  );
}
