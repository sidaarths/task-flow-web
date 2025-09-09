'use client';

import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';
import type { Board } from '@/types';

interface BoardCardProps {
  board: Board;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
  currentUserId?: string;
}

export default function BoardCard({
  board,
  onEdit,
  onDelete,
  currentUserId,
}: BoardCardProps) {
  const router = useRouter();
  const isOwner = board.createdBy === currentUserId;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCardClick = () => {
    router.push(`/boards/${board._id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(board);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(board);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-gray-300/60 dark:hover:border-gray-600/60 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
            {board.title}
          </h3>
          <p className="text-sm text-gray-600/80 dark:text-gray-400/80 line-clamp-2 leading-relaxed">
            {board.description || 'No description provided'}
          </p>
        </div>

        {isOwner && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleEditClick}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200"
              title="Edit board"
            >
              <IconEdit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
              title="Delete board"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500/80 dark:text-gray-400/80">
        <div className="flex items-center space-x-4">
          <span>Created {formatDate(board.createdAt)}</span>
          <span className="flex items-center space-x-1">
            <IconUsers className="w-3 h-3" />
            <span>
              {board.members.length} member
              {board.members.length !== 1 ? 's' : ''}
            </span>
          </span>
        </div>
        {isOwner && (
          <span className="text-blue-600/80 dark:text-blue-400/80 font-medium">
            Owner
          </span>
        )}
        {!isOwner && (
          <span className="text-gray-400/80 dark:text-gray-500/80 italic">
            Member
          </span>
        )}
      </div>
    </div>
  );
}
