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

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Entire card is a drop target for task drag-and-drop
  const { isOver, setNodeRef } = useDroppable({ id: `list-${list._id}` });

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  const taskIds = sortedTasks.map((task) => task._id);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border w-full min-w-0 overflow-hidden transition-all duration-200 flex flex-col ${
        isOver
          ? 'border-blue-500 border-2 shadow-lg ring-2 ring-blue-500 ring-opacity-30'
          : 'border-gray-200/60 dark:border-gray-700/60'
      }`}
    >
      {/* List Header */}
      <div className="p-3 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-start justify-between">
          {/* Left/Right arrow buttons + title */}
          <div className="flex items-center gap-1 flex-1 min-w-0 pr-1">
            <button
              onClick={onMoveLeft}
              className={`p-0.5 rounded flex-shrink-0 transition-all duration-150 ${
                canMoveLeft
                  ? 'text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 cursor-pointer'
                  : 'invisible pointer-events-none'
              }`}
              title="Move list left"
              aria-label={`Move ${list.title} left`}
            >
              <IconChevronLeft className="w-3.5 h-3.5" />
            </button>

            <h3 className="font-semibold text-gray-900 dark:text-white break-words flex-1 min-w-0 text-center">
              {list.title}
            </h3>

            <button
              onClick={onMoveRight}
              className={`p-0.5 rounded flex-shrink-0 transition-all duration-150 ${
                canMoveRight
                  ? 'text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 cursor-pointer'
                  : 'invisible pointer-events-none'
              }`}
              title="Move list right"
              aria-label={`Move ${list.title} right`}
            >
              <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Options menu */}
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 rounded transition-all duration-200"
              aria-label={`List options for ${list.title}`}
            >
              <IconDotsVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200/60 dark:border-gray-600/60 py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEditList(list);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <IconEdit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteList(list);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <IconTrash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500/80 dark:text-gray-400/80 mt-1 text-center">
          {searchQuery &&
          totalTasksInList !== undefined &&
          sortedTasks.length !== totalTasksInList ? (
            <span>
              {sortedTasks.length} of {totalTasksInList} task
              {totalTasksInList !== 1 ? 's' : ''} shown
            </span>
          ) : (
            <span>
              {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="p-3 space-y-2 flex-1">
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

        <button
          onClick={() => setShowCreateTaskModal(true)}
          className="w-full p-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add a task</span>
        </button>
      </div>

      {/* Task Create Modal — creation still uses a focused dialog */}
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
