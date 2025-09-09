'use client';

import { useState, useEffect } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';
import { List } from '@/types';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listId: string, title: string) => Promise<void>;
  list: List | null;
  isLoading?: boolean;
}

export default function EditListModal({
  isOpen,
  onClose,
  onSubmit,
  list,
  isLoading = false,
}: EditListModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (list) {
      setTitle(list.title);
    }
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('List title is required');
      return;
    }

    if (!list) return;

    try {
      setError('');
      await onSubmit(list._id, title.trim());
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update list'
      );
    }
  };

  const handleClose = () => {
    setTitle('');
    setError('');
    onClose();
  };

  if (!isOpen || !list) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit List
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
            disabled={isLoading}
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              List Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter list title..."
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>Update List</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
