'use client';

import { IconCalendar, IconUser } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { MagicCard } from '@/components/magicui/magic-card';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  searchQuery?: string;
}

export default function TaskCard({ task, onClick, searchQuery }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: task._id });

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const highlightText = (text: string, query?: string) => {
    if (!query?.trim()) return text;
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="rounded bg-yellow-200 text-gray-900 dark:bg-yellow-800/50 dark:text-white">
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

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'min-w-0 cursor-pointer',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <MagicCard
        className={cn(
          'rounded-lg border bg-white shadow-sm transition-all duration-200',
          'dark:bg-gray-700/80',
          isDragging
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/40 dark:border-blue-400'
            : isOver
              ? 'border-blue-400 ring-1 ring-blue-400/30'
              : 'border-gray-200/70 hover:border-gray-300 hover:shadow-md dark:border-gray-600/60 dark:hover:border-gray-500'
        )}
      >
        <div className="space-y-2.5 p-3">
          {/* Title */}
          <h4 className="break-words text-sm font-medium leading-snug text-gray-900 dark:text-white">
            {highlightText(task.title, searchQuery)}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {highlightText(task.description, searchQuery)}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {/* Labels */}
              {task.labels.slice(0, 2).map((label, i) => {
                const isHighlighted =
                  searchQuery?.trim() &&
                  label.toLowerCase().includes(searchQuery.toLowerCase().trim());
                return (
                  <span
                    key={i}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs transition-all duration-150',
                      isHighlighted
                        ? 'bg-yellow-100 text-yellow-900 ring-1 ring-yellow-300 dark:bg-yellow-800/50 dark:text-yellow-200 dark:ring-yellow-700'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    )}
                  >
                    {highlightText(label, searchQuery)}
                  </span>
                );
              })}
              {task.labels.length > 2 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-600 dark:text-gray-400">
                  +{task.labels.length - 2}
                </span>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
                    isOverdue
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : isToday
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                  )}
                >
                  <IconCalendar className="h-3 w-3 shrink-0" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            {/* Assignees */}
            {task.assignedTo.length > 0 && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                <IconUser className="h-3 w-3" />
                {task.assignedTo.length}
              </span>
            )}
          </div>
        </div>
      </MagicCard>
    </div>
  );
}
