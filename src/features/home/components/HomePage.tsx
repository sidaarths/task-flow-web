'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  CreateBoardModal,
  EditBoardModal,
  DeleteBoardModal,
  BoardCard,
} from '@/features/board';
import {
  IconAlertTriangle,
  IconLoader2,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { useBoards, useCreateBoard, useUpdateBoard, useDeleteBoard } from '@/hooks/useBoards';

export default function HomePage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || '';
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  // React Query — replaces useState/useEffect/loadInitialData
  const { data: boards = [], isLoading, isError, error, refetch } = useBoards();
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const deleteBoard = useDeleteBoard();

  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    const query = searchQuery.toLowerCase().trim();
    return boards.filter(
      (board) =>
        board.title.toLowerCase().includes(query) ||
        board.description?.toLowerCase().includes(query)
    );
  }, [boards, searchQuery]);

  const handleCreateBoard = async (data: CreateBoardRequest) => {
    await createBoard.mutateAsync(data);
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsEditModalOpen(true);
  };

  const handleUpdateBoard = async (boardId: string, data: UpdateBoardRequest) => {
    await updateBoard.mutateAsync({ boardId, data });
  };

  const handleDeleteBoard = (board: Board) => {
    setDeletingBoard(board);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (boardId: string) => {
    await deleteBoard.mutateAsync(boardId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <IconLoader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Loading your boards...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <IconAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Something went wrong
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {error instanceof Error ? error.message : 'Failed to load boards'}
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Your Boards'}
          </h1>
          <p className="text-gray-600/80 dark:text-gray-400/80">
            {searchQuery
              ? `Found ${filteredBoards.length} board${filteredBoards.length !== 1 ? 's' : ''} matching your search`
              : 'Manage your projects and collaborate with your team'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md focus:ring-2 focus:ring-blue-500/20"
        >
          <IconPlus className="h-4 w-4" />
          <span>New Board</span>
        </button>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No boards yet</h3>
          <p className="mx-auto mb-6 max-w-md text-gray-600/80 dark:text-gray-400/80">
            Create your first board to start organizing your projects and tasks
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
          >
            <IconPlus className="h-4 w-4" />
            <span>Create Your First Board</span>
          </button>
        </div>
      ) : filteredBoards.length === 0 && searchQuery ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <IconSearch className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No boards found</h3>
          <p className="mx-auto mb-6 max-w-md text-gray-600/80 dark:text-gray-400/80">
            No boards match your search for &quot;{searchQuery}&quot;.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => router.replace('/home')}
              className="inline-flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <span>Clear Search</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
            >
              <IconPlus className="h-4 w-4" />
              <span>Create Board</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board._id}
              board={board}
              onEdit={handleEditBoard}
              onDelete={handleDeleteBoard}
              currentUserId={currentUser?._id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />
      <EditBoardModal
        isOpen={isEditModalOpen}
        board={editingBoard}
        onClose={() => { setIsEditModalOpen(false); setEditingBoard(null); }}
        onUpdate={handleUpdateBoard}
      />
      <DeleteBoardModal
        isOpen={isDeleteModalOpen}
        board={deletingBoard}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingBoard(null); }}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
