'use client';

import { Board } from '../api/boards';

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
  const isOwner = board.createdBy === currentUserId;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-gray-300/60 dark:hover:border-gray-600/60">
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
          <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(board)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200"
              title="Edit board"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(board)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
              title="Delete board"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500/80 dark:text-gray-400/80">
        <div className="flex items-center space-x-4">
          <span>Created {formatDate(board.createdAt)}</span>
          <span className="flex items-center space-x-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
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
