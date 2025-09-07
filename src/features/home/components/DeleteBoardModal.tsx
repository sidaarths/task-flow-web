'use client';

import { useState } from 'react';
import { Board } from '../api/boards';
import {
  IconAlertTriangle,
  IconLoader2,
  IconTrash,
  IconX,
} from '@tabler/icons-react';

interface DeleteBoardModalProps {
  isOpen: boolean;
  board: Board | null;
  onClose: () => void;
  onDelete: (boardId: string) => Promise<void>;
}

export default function DeleteBoardModal({
  isOpen,
  board,
  onClose,
  onDelete,
}: DeleteBoardModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!board) return;

    setError(null);
    setIsDeleting(true);
    try {
      await onDelete(board._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !board) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 w-full max-w-md transform transition-all duration-200 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <IconTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Board
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-gray-900 dark:text-white">
              Are you sure you want to delete{' '}
              <strong>&quot;{board.title}&quot;</strong>?
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IconAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">
                    This action cannot be undone.
                  </p>
                  <p>
                    All lists, tasks, and data associated with this board will
                    be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDeleting && <IconLoader2 className="w-4 h-4 animate-spin" />}
              <span>{isDeleting ? 'Deleting...' : 'Delete Board'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
