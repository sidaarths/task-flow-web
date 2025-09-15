'use client';

import { useState } from 'react';
import {
  IconCalendar,
  IconUser,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenDetails: () => void;
  searchQuery?: string;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onOpenDetails,
  searchQuery,
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isToday =
    task.dueDate &&
    new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div
      className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-600/60 p-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer group min-w-0 overflow-hidden relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action buttons - shown on hover */}
      <div
        className={`absolute top-2 right-2 flex items-center space-x-1 transition-all duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          onClick={handleEdit}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200"
          title="Edit task"
        >
          <IconEdit className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
          title="Delete task"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3" onClick={onOpenDetails}>
        {/* Title */}
        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight break-words pr-12">
          {highlightText(task.title, searchQuery)}
        </h4>

        {/* Description Preview */}
        {task.description && (
          <p className="text-xs text-gray-600/80 dark:text-gray-400/80 line-clamp-2 leading-relaxed">
            {highlightText(task.description, searchQuery)}
          </p>
        )}

        {/* Task Meta Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center space-x-1">
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
                      className={`px-2 py-0.5 text-xs rounded-full transition-all duration-200 ${
                        isHighlighted
                          ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 ring-2 ring-yellow-300 dark:ring-yellow-700'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {highlightText(label, searchQuery)}
                    </span>
                  );
                })}
                {task.labels.length > 2 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded-full">
                    +{task.labels.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 ${
                  isOverdue
                    ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                    : isToday
                      ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
                      : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                }`}
              >
                <IconCalendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>

          {/* Assigned Users Count */}
          {task.assignedTo.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded-full text-xs">
              <IconUser className="w-3 h-3" />
              <span>{task.assignedTo.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
