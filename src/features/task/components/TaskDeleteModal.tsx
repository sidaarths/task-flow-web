'use client';

import { IconX, IconAlertTriangle } from '@tabler/icons-react';
import type { Task } from '@/types';

interface TaskDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
  task: Task | null;
  isLoading?: boolean;
}

export default function TaskDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  task,
  isLoading = false,
}: TaskDeleteModalProps) {
  const handleConfirm = async () => {
    if (!task) return;

    try {
      await onConfirm(task._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md transform transition-all duration-200 scale-100 max-h-[98vh] overflow-visible">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-600/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <IconAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
            disabled={isLoading}
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the task{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              &ldquo;{task.title}&rdquo;
            </span>
            ?
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <IconAlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-800 dark:text-red-300">
                <div className="font-medium mb-1">
                  Warning: This action cannot be undone
                </div>
                <div>
                  The task and all its data will be permanently deleted.
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span>Delete Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
