 'use client';

import { useMemo } from 'react';
import {
  IconX,
  IconCalendar,
  IconUser,
  IconTag,
  IconClock,
} from '@tabler/icons-react';
import type { Task } from '@/types';

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
}: TaskDetailsModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const now = useMemo(() => new Date(), []);
  const dueDateObj = useMemo(() => (task.dueDate ? new Date(task.dueDate) : null), [task.dueDate]);

  const isOverdue = Boolean(dueDateObj && dueDateObj < now);
  const isToday = Boolean(dueDateObj && dueDateObj.toDateString() === now.toDateString());

  const formattedDueDate = useMemo(() => formatDate(task.dueDate), [task.dueDate]);
  const formattedCreatedAt = useMemo(() => formatDate(task.createdAt), [task.createdAt]);
  const formattedUpdatedAt = useMemo(() => formatDate(task.updatedAt), [task.updatedAt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-600/60">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Task Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task.title}
            </h3>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {task.description || (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  No description provided
                </span>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <div className="flex items-center space-x-2">
              <IconCalendar className="w-5 h-5 text-gray-500" />
              {task.dueDate ? (
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      isOverdue
                        ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                        : isToday
                          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
                          : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {formattedDueDate}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  No due date set
                </span>
              )}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="flex items-center space-x-2">
              <IconTag className="w-5 h-5 text-gray-500" />
              {task.labels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  No labels added
                </span>
              )}
            </div>
          </div>

          {/* Assigned Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assigned Users
            </label>
            <div className="flex items-center space-x-2">
              <IconUser className="w-5 h-5 text-gray-500" />
              {task.assignedTo.length > 0 ? (
                <span className="px-3 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                  {task.assignedTo.length} user
                  {task.assignedTo.length !== 1 ? 's' : ''} assigned
                </span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  No users assigned
                </span>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/60 dark:border-gray-600/60">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created
              </label>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <IconClock className="w-4 h-4" />
                <span>{formattedCreatedAt}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Updated
              </label>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <IconClock className="w-4 h-4" />
                <span>{formattedUpdatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
