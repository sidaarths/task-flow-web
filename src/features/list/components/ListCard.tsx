'use client';

import { useState, useEffect, useRef } from 'react';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, Task } from '@/types';
import TaskCard from '@/features/task';
import { TaskCreateModal } from '@/features/task';
import { listApi } from '@/features/list/api/list';
import { MagicCard } from '@/components/magicui/magic-card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ListCardProps {
  list: List;
  tasks: Task[];
  onEditList: (list: List) => void;
  onDeleteList: (list: List) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onOpenTask: (task: Task) => void;
  searchQuery?: string;
  totalTasksInList?: number;
}

export default function ListCard({
  list,
  tasks,
  onEditList,
  onDeleteList,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  onOpenTask,
  searchQuery,
  totalTasksInList,
}: ListCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const { isOver, setNodeRef } = useDroppable({ id: `list-${list._id}` });
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  const taskIds = sortedTasks.map((t) => t._id);

  const showFilteredCount =
    searchQuery && totalTasksInList !== undefined && sortedTasks.length !== totalTasksInList;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl transition-all duration-200',
        isOver && 'ring-2 ring-blue-500/40'
      )}
    >
      <MagicCard
        className={cn(
          'flex flex-col rounded-xl border bg-white shadow-sm dark:bg-gray-800',
          isOver
            ? 'border-blue-400 dark:border-blue-500'
            : 'border-gray-200/60 dark:border-gray-700/60'
        )}
      >
        {/* Header */}
        <div className="border-b border-gray-200/60 px-3 py-2.5 dark:border-gray-700/60">
          <div className="flex items-center gap-1">
            {/* Move left */}
            <button
              onClick={onMoveLeft}
              aria-label={`Move ${list.title} left`}
              title="Move list left"
              className={cn(
                'shrink-0 rounded p-0.5 transition-all duration-150',
                canMoveLeft
                  ? 'cursor-pointer text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-600 dark:hover:bg-gray-700/60 dark:hover:text-gray-300'
                  : 'invisible pointer-events-none'
              )}
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Title */}
            <h3 className="flex-1 truncate text-center text-sm font-semibold text-gray-900 dark:text-white">
              {list.title}
            </h3>

            {/* Move right */}
            <button
              onClick={onMoveRight}
              aria-label={`Move ${list.title} right`}
              title="Move list right"
              className={cn(
                'shrink-0 rounded p-0.5 transition-all duration-150',
                canMoveRight
                  ? 'cursor-pointer text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:text-gray-600 dark:hover:bg-gray-700/60 dark:hover:text-gray-300'
                  : 'invisible pointer-events-none'
              )}
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Options menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label={`List options for ${list.title}`}
                className="rounded p-1 text-gray-400 transition-all duration-150 hover:bg-gray-200/60 hover:text-gray-600 dark:hover:bg-gray-700/60 dark:hover:text-gray-300"
              >
                <IconDotsVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-lg border border-gray-200/60 bg-white py-1 shadow-lg dark:border-gray-600/60 dark:bg-gray-700">
                  <button
                    onClick={() => { onEditList(list); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDeleteList(list); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-600"
                  >
                    <IconTrash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task count */}
          <p className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
            {showFilteredCount
              ? `${sortedTasks.length} of ${totalTasksInList} task${totalTasksInList !== 1 ? 's' : ''} shown`
              : `${sortedTasks.length} task${sortedTasks.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Tasks — scrollable area */}
        <div className="flex-1 space-y-2 overflow-y-auto p-2.5" style={{ maxHeight: '60vh' }}>
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {sortedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onOpenTask(task)}
                searchQuery={searchQuery}
              />
            ))}
          </SortableContext>
        </div>

        {/* Add task — pinned footer */}
        <div className="border-t border-gray-200/40 p-2 dark:border-gray-700/40">
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition-all duration-150 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <IconPlus className="h-4 w-4" />
            Add a task
          </button>
        </div>
      </MagicCard>

      <TaskCreateModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onCreate={async (data) => {
          await listApi.createTask(list._id, data);
          setShowCreateTaskModal(false);
        }}
        listTitle={list.title}
      />
    </div>
  );
}
