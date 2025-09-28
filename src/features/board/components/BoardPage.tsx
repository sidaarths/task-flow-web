'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  IconPlus,
  IconArrowLeft,
  IconUsers,
  IconAlertTriangle,
  IconClipboardText,
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
import { useBoard } from '@/context/BoardContext';
import { boardApi } from '@/features/board/api/board';
import { listApi } from '@/features/list/api/list';
import {
  InviteUsersModal,
  BoardMembersModal,
} from '@/features/board-member-management';
import ListCard, {
  CreateListModal,
  EditListModal,
  DeleteListModal,
} from '@/features/list';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const {
    boardData,
    loading,
    error,
    fetchBoardData,
    addList,
    updateList,
    deleteList,
    addBoardMembers,
    removeBoardMember,
    moveTask,
  } = useBoard();

  const boardId = params.boardId as string;
  const searchQuery = searchParams.get('query') || '';

  // Modal states
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [showInviteUsersModal, setShowInviteUsersModal] = useState(false);
  const [showBoardMembersModal, setShowBoardMembersModal] = useState(false);
  const [selectedList, setSelectedList] = useState<List | null>(null);

  // Loading states
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);

  // Drag and drop states
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoardData(boardId);
    }
  }, [boardId, fetchBoardData]);

  const handleCreateList = async (title: string) => {
    try {
      setIsCreatingList(true);
      const newList = await boardApi.createList(boardId, { title });
      addList(newList);
    } catch (error) {
      throw error;
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleEditList = (list: List) => {
    setSelectedList(list);
    setShowEditListModal(true);
  };

  const handleUpdateList = async (listId: string, title: string) => {
    try {
      setIsUpdatingList(true);
      const updatedList = await listApi.updateList(listId, { title });
      updateList(updatedList);
    } catch (error) {
      throw error;
    } finally {
      setIsUpdatingList(false);
    }
  };

  const handleDeleteList = (list: List) => {
    setSelectedList(list);
    setShowDeleteListModal(true);
  };

  const handleConfirmDeleteList = async (listId: string) => {
    try {
      setIsDeletingList(true);
      await listApi.deleteList(listId);
      deleteList(listId);
    } catch (error) {
      throw error;
    } finally {
      setIsDeletingList(false);
    }
  };

  const handleMembersAdded = async (newMemberIds: string[]) => {
    try {
      addBoardMembers(newMemberIds);
    } catch (error) {
      console.error('Failed to add members:', error);
    }
  };

  const handleMemberRemoved = async (removedUserId: string) => {
    try {
      removeBoardMember(removedUserId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;

    // Find the task being dragged
    const task = boardData?.tasks.find((t) => t._id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over || !boardData) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedTask = boardData.tasks.find((t) => t._id === activeId);
    if (!draggedTask) return;

    // Determine target list ID
    let targetListId: string;
    let targetPosition: number;

    if (overId.startsWith('list-')) {
      // Dropped on a list container
      targetListId = overId.replace('list-', '');
      const tasksInTargetList = boardData.tasks.filter(
        (t) => t.listId === targetListId
      );
      targetPosition = tasksInTargetList.length;
    } else {
      // Dropped on another task
      const targetTask = boardData.tasks.find((t) => t._id === overId);
      if (!targetTask) return;

      targetListId = targetTask.listId;
      const tasksInList = boardData.tasks
        .filter((t) => t.listId === targetListId)
        .sort((a, b) => a.position - b.position);

      targetPosition = tasksInList.findIndex((t) => t._id === overId);
    }

    // If nothing changed, return
    if (
      draggedTask.listId === targetListId &&
      draggedTask.position === targetPosition
    ) {
      return;
    }

    // Optimistically update the UI first
    moveTask(activeId, targetListId, targetPosition);

    try {
      const { taskApi } = await import('@/features/task/api/task');

      // Update task position/list on the server
      await taskApi.updateTaskPosition(activeId, targetPosition, targetListId);
    } catch (error) {
      console.error('Failed to move task:', error);
      // If the API call fails, refresh the board data to revert the optimistic update
      await fetchBoardData(boardId);
    }
  };

  // Filter tasks based on search query
  const { sortedLists, getTasksForList, getTotalTasksForList } = useMemo(() => {
    const getTasksForListFn = (listId: string): Task[] => {
      if (!boardData?.tasks) return [];

      let tasks = boardData.tasks.filter((task) => task.listId === listId);
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.labels?.some((label) => label.toLowerCase().includes(query))
        );
      }

      return tasks;
    };

    const getTotalTasksForListFn = (listId: string): number => {
      if (!boardData?.tasks) return 0;
      return boardData.tasks.filter((task) => task.listId === listId).length;
    };

    // Always show all lists, sorted by position
    const getAllListsSorted = () => {
      if (!boardData?.lists) return [];
      return [...boardData.lists].sort((a, b) => a.position - b.position);
    };

    return {
      sortedLists: getAllListsSorted(),
      getTasksForList: getTasksForListFn,
      getTotalTasksForList: getTotalTasksForListFn,
    };
  }, [boardData?.lists, boardData?.tasks, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <IconAlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Failed to Load Board
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => fetchBoardData(boardId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!boardData) return null;

  const isOwner = currentUser && boardData.board.createdBy === currentUser._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/home')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
              >
                <IconArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {boardData.board.title}
                </h1>
                {boardData.board.description && (
                  <p className="text-sm text-gray-600/80 dark:text-gray-400/80">
                    {boardData.board.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBoardMembersModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                title="View board members"
              >
                <IconUsers className="w-4 h-4" />
                <span>
                  {boardData.board.members.length} member
                  {boardData.board.members.length !== 1 ? 's' : ''}
                </span>
              </button>

              {isOwner && (
                <button
                  onClick={() => setShowInviteUsersModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                >
                  <IconUserPlus className="w-4 h-4" />
                  <span>Invite Users</span>
                </button>
              )}

              <button
                onClick={() => setShowCreateListModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <IconPlus className="w-4 h-4" />
                <span>Add List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className="grid gap-3 pb-6 w-full"
            style={{
              gridTemplateColumns:
                sortedLists.length > 0
                  ? `repeat(${sortedLists.length}, 1fr)`
                  : '1fr',
            }}
          >
            {sortedLists.map((list) => (
              <ListCard
                key={list._id}
                list={list}
                tasks={getTasksForList(list._id)}
                onEditList={handleEditList}
                onDeleteList={handleDeleteList}
                searchQuery={searchQuery}
                totalTasksInList={getTotalTasksForList(list._id)}
              />
            ))}

            {sortedLists.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <IconClipboardText className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4 mx-auto" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No lists yet
                </h3>
                <p className="text-gray-600/80 dark:text-gray-400/80 mb-6 max-w-sm">
                  Create your first list to start organizing tasks for this
                  board.
                </p>
                <button
                  onClick={() => setShowCreateListModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                >
                  <IconPlus className="w-5 h-5" />
                  <span>Create Your First List</span>
                </button>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-blue-500 p-4 opacity-90 transform rotate-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeTask.title}
                </h4>
                {activeTask.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {activeTask.description}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onSubmit={handleCreateList}
        isLoading={isCreatingList}
      />

      <EditListModal
        isOpen={showEditListModal}
        onClose={() => {
          setShowEditListModal(false);
          setSelectedList(null);
        }}
        onSubmit={handleUpdateList}
        list={selectedList}
        isLoading={isUpdatingList}
      />

      <DeleteListModal
        isOpen={showDeleteListModal}
        onClose={() => {
          setShowDeleteListModal(false);
          setSelectedList(null);
        }}
        onConfirm={handleConfirmDeleteList}
        list={selectedList}
        isLoading={isDeletingList}
      />

      {isOwner && (
        <InviteUsersModal
          isOpen={showInviteUsersModal}
          onClose={() => setShowInviteUsersModal(false)}
          boardId={boardId}
          existingMemberIds={boardData.board.members}
          onMembersAdded={handleMembersAdded}
        />
      )}

      <BoardMembersModal
        isOpen={showBoardMembersModal}
        onClose={() => setShowBoardMembersModal(false)}
        board={boardData.board}
        onMemberRemoved={handleMemberRemoved}
      />
    </div>
  );
}
