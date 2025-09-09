'use client';

import { useState } from 'react';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconUser,
} from '@tabler/icons-react';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  searchQuery?: string;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  searchQuery,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;

    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800/50 text-gray-900 dark:text-white"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200/60 dark:border-gray-600/60 p-3 hover:shadow-md transition-all duration-200 group min-w-0 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight break-words">
            {highlightText(task.title, searchQuery)}
          </h4>

          {task.description && (
            <p className="text-xs text-gray-600/80 dark:text-gray-400/80 mt-1 line-clamp-2 leading-relaxed">
              {highlightText(task.description, searchQuery)}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {/* Labels */}
              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.labels.slice(0, 2).map((label, index) => {
                    const isHighlighted =
                      searchQuery &&
                      searchQuery.trim() &&
                      label
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase().trim());

                    return (
                      <span
                        key={index}
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          isHighlighted
                            ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 ring-2 ring-yellow-300 dark:ring-yellow-700'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {highlightText(label, searchQuery)}
                      </span>
                    );
                  })}
                  {task.labels.length > 2 && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full">
                      +{task.labels.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${
                    isOverdue
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <IconCalendar className="w-3 h-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}

              {/* Assigned Users */}
              {task.assignedTo.length > 0 && (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  <IconUser className="w-3 h-3" />
                  <span>{task.assignedTo.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <IconDotsVertical className="w-3 h-3" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 bg-white dark:bg-gray-600 rounded-md shadow-lg border border-gray-200/60 dark:border-gray-500/60 py-1 z-20 min-w-[100px]">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center space-x-2"
              >
                <IconEdit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-500 flex items-center space-x-2"
              >
                <IconTrash className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
