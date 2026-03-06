'use client';

import { IconCalendar, IconUser } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  searchQuery?: string;
}

export default function TaskCard({ task, onClick, searchQuery }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task._id });

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
  const isToday =
    task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm border p-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200 min-w-0 overflow-hidden cursor-pointer ${
        isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-blue-500 ring-opacity-50 z-50 border-gray-200/60 dark:border-gray-600/60'
          : isOver
            ? 'border-blue-500 border-2 shadow-lg ring-2 ring-blue-500 ring-opacity-30'
            : 'border-gray-200/60 dark:border-gray-600/60'
      }`}
    >
      <div className="space-y-3">
        {/* Title */}
        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight break-words">
          {highlightText(task.title, searchQuery)}
        </h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-gray-600/80 dark:text-gray-400/80 line-clamp-2 leading-relaxed">
            {highlightText(task.description, searchQuery)}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center space-x-1">
                {task.labels.slice(0, 2).map((label, index) => {
                  const isHighlighted =
                    searchQuery &&
                    searchQuery.trim() &&
                    label.toLowerCase().includes(searchQuery.toLowerCase().trim());
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

          {/* Assigned count */}
          {task.assignedTo.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
              <IconUser className="w-3 h-3" />
              <span>{task.assignedTo.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
