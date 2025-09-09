'use client';

import { useState } from 'react';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import type { List, Task } from '@/types';
import TaskCard from '@/features/task';

interface ListCardProps {
  list: List;
  tasks: Task[];
  onEditList: (list: List) => void;
  onDeleteList: (list: List) => void;
  onCreateTask: (listId: string, title: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  searchQuery?: string;
  totalTasksInList?: number; // Total tasks before filtering
}

export default function ListCard({
  list,
  tasks,
  onEditList,
  onDeleteList,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  searchQuery,
  totalTasksInList,
}: ListCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      setIsCreatingTask(true);
      await onCreateTask(list._id, newTaskTitle.trim());
      setNewTaskTitle('');
      setShowCreateTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-700/60 w-full min-w-0 overflow-hidden">
      {/* List Header */}
      <div className="p-3 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white break-words flex-1 min-w-0 pr-2">
            {list.title}
          </h3>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 rounded transition-all duration-200"
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

        <div className="text-xs text-gray-500/80 dark:text-gray-400/80 mt-1">
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
      <div className="p-2 space-y-2">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task)}
            searchQuery={searchQuery}
          />
        ))}

        {/* Create Task Form */}
        {showCreateTask ? (
          <form onSubmit={handleCreateTask} className="space-y-2">
            <textarea
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
              rows={2}
              autoFocus
              disabled={isCreatingTask}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateTask(false);
                  setNewTaskTitle('');
                }}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
                disabled={isCreatingTask}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition-all duration-200"
                disabled={isCreatingTask || !newTaskTitle.trim()}
              >
                {isCreatingTask ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateTask(true)}
            className="w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 flex items-center space-x-2"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add a task</span>
          </button>
        )}
      </div>
    </div>
  );
}
