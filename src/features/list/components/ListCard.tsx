'use client';

import { useState } from 'react';
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List, Task } from '@/types';
import TaskCard from '@/features/task';
import {
  TaskDetailsModal,
  TaskCreateModal,
  TaskEditModal,
  TaskDeleteModal,
} from '@/features/task';
import { useBoard } from '@/context/BoardContext';
import { listApi } from '@/features/list/api/list';
import { taskApi } from '@/features/task/api/task';

interface ListCardProps {
  list: List;
  tasks: Task[];
  onEditList: (list: List) => void;
  onDeleteList: (list: List) => void;
  searchQuery?: string;
  totalTasksInList?: number;
}

export default function ListCard({
  list,
  tasks,
  onEditList,
  onDeleteList,
  searchQuery,
  totalTasksInList
}: ListCardProps) {
  const { addTask, updateTask, deleteTask } = useBoard();
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [showTaskDeleteModal, setShowTaskDeleteModal] = useState(false);

  // Droppable functionality
  const { isOver, setNodeRef } = useDroppable({
    id: `list-${list._id}`,
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setShowTaskEditModal(true);
  };

  const handleTaskDelete = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDeleteModal(true);
  };

  const handleUpdateTask = async (
    taskId: string,
    data: {
      title?: string;
      description?: string;
      labels?: string[];
      dueDate?: string;
    }
  ) => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, data);
      updateTask(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  const taskIds = sortedTasks.map((task) => task._id);

  return (
    <div 
      ref={setNodeRef}
      className={`bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border w-full min-w-0 overflow-hidden transition-all duration-200 ${
        isOver 
          ? 'border-blue-500 border-2 shadow-lg ring-2 ring-blue-500 ring-opacity-30' 
          : 'border-gray-200/60 dark:border-gray-700/60'
      }`}
    >
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
      <div className="p-3 space-y-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
              onOpenDetails={() => handleTaskClick(task)}
              searchQuery={searchQuery}
            />
          ))}
        </SortableContext>

        {/* Create Task Quick Form */}
        <button
          onClick={() => setShowCreateTaskModal(true)}
          className="w-full p-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add a task</span>
        </button>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={showTaskDetails}
          onClose={() => {
            setShowTaskDetails(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Task Edit Modal */}
      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          isOpen={showTaskEditModal}
          onClose={() => {
            setShowTaskEditModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleUpdateTask}
        />
      )}

      {/* Task Delete Modal */}
      {selectedTask && (
        <TaskDeleteModal
          task={selectedTask}
          isOpen={showTaskDeleteModal}
          onClose={() => {
            setShowTaskDeleteModal(false);
            setSelectedTask(null);
          }}
          onConfirm={handleDeleteTask}
        />
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onCreate={async (data) => {
          const newTask = await listApi.createTask(list._id, data);
          addTask(newTask);
          setShowCreateTaskModal(false);
        }}
        listTitle={list.title}
      />
    </div>
  );
}
