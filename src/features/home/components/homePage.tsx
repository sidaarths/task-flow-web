'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Board,
  boardsApi,
  CreateBoardRequest,
  UpdateBoardRequest,
} from '../api/boards';
import { getUserProfile, User } from '@/features/header/api/user';
import BoardCard from './BoardCard';
import CreateBoardModal from './CreateBoardModal';
import EditBoardModal from './EditBoardModal';
import DeleteBoardModal from './DeleteBoardModal';
import {
  IconAlertTriangle,
  IconLoader2,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('query') || '';

  const [boards, setBoards] = useState<Board[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  // Filter boards based on search query
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) {
      return boards;
    }

    const query = searchQuery.toLowerCase().trim();
    return boards.filter(
      (board) =>
        board.title.toLowerCase().includes(query) ||
        board.description?.toLowerCase().includes(query)
    );
  }, [boards, searchQuery]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [boardsData, userData] = await Promise.all([
        boardsApi.getBoards(),
        getUserProfile(),
      ]);

      setBoards(boardsData);
      setCurrentUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data: CreateBoardRequest) => {
    try {
      const newBoard = await boardsApi.createBoard(data);
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      throw err; // Re-throw to be handled by the modal
    }
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setIsEditModalOpen(true);
  };

  const handleUpdateBoard = async (
    boardId: string,
    data: UpdateBoardRequest
  ) => {
    try {
      const updatedBoard = await boardsApi.updateBoard(boardId, data);
      setBoards((prev) =>
        prev.map((board) => (board._id === boardId ? updatedBoard : board))
      );
    } catch (err) {
      throw err; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteBoard = (board: Board) => {
    setDeletingBoard(board);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (boardId: string) => {
    try {
      await boardsApi.deleteBoard(boardId);
      setBoards((prev) => prev.filter((board) => board._id !== boardId));
    } catch (err) {
      throw err; // Re-throw to be handled by the modal
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <IconLoader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Loading your boards...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <IconAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={loadInitialData}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : 'Your Boards'}
          </h1>
          <p className="text-gray-600/80 dark:text-gray-400/80">
            {searchQuery
              ? `Found ${filteredBoards.length} board${filteredBoards.length !== 1 ? 's' : ''} matching your search`
              : 'Manage your projects and collaborate with your team'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
        >
          <IconPlus className="w-4 h-4" />
          <span>New Board</span>
        </button>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No boards yet
          </h3>
          <p className="text-gray-600/80 dark:text-gray-400/80 mb-6 max-w-md mx-auto">
            Create your first board to start organizing your projects and tasks
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Your First Board</span>
          </button>
        </div>
      ) : filteredBoards.length === 0 && searchQuery ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <IconSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No boards found
          </h3>
          <p className="text-gray-600/80 dark:text-gray-400/80 mb-6 max-w-md mx-auto">
            No boards match your search for &quot;{searchQuery}&quot;. Try a
            different search term or create a new board.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <span>Clear Search</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200"
            >
              <IconPlus className="w-4 h-4" />
              <span>Create Board</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBoard(null);
        }}
        onUpdate={handleUpdateBoard}
      />

      <DeleteBoardModal
        isOpen={isDeleteModalOpen}
        board={deletingBoard}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBoard(null);
        }}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
