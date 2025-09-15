'use client';
import { useState, useEffect } from 'react';
import { IconX, IconCheck, IconPlus } from '@tabler/icons-react';
import type { Task, UpdateTaskRequest } from '@/types';
import DatePicker from '@/components/DatePicker';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, data: UpdateTaskRequest) => Promise<void>;
  task: Task | null;
  isLoading?: boolean;
}

export default function TaskEditModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
}: TaskEditModalProps) {
  interface TaskEditFormData {
    title: string;
    description?: string;
    labels: string[];
    dueDate: Date | null;
  }

  const [editData, setEditData] = useState<TaskEditFormData>({
    title: '',
    description: '',
    labels: [],
    dueDate: null,
  });
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        labels: [...task.labels],
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editData.title?.trim()) {
      setError('Task title is required');
      return;
    }

    if (!task) return;

    try {
      setError('');
      const updateData: UpdateTaskRequest = {
        ...editData,
        dueDate: editData.dueDate ? editData.dueDate.toISOString() : undefined,
      };
      await onSubmit(task._id, updateData);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update task'
      );
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !editData.labels?.includes(newLabel.trim())) {
      setEditData({
        ...editData,
        labels: [...(editData.labels || []), newLabel.trim()],
      });
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setEditData({
      ...editData,
      labels: editData.labels?.filter((label) => label !== labelToRemove) || [],
    });
  };

  const handleClose = () => {
    setEditData({
      title: '',
      description: '',
      labels: [],
      dueDate: null,
    });
    setNewLabel('');
    setError('');
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[98vh] overflow-visible">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-600/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Task
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
            disabled={isLoading}
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title
              <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={editData.title || ''}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter task title"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={editData.description || ''}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Enter task description"
              disabled={isLoading}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <DatePicker
              value={editData.dueDate}
              onChange={(date) => setEditData({ ...editData, dueDate: date })}
              placeholder="Select due date"
              minDate={new Date()}
              disabled={isLoading}
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {editData.labels?.map((label, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                      disabled={isLoading}
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add label"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 flex items-center space-x-1 disabled:bg-blue-400"
                  disabled={isLoading || !newLabel.trim()}
                >
                  <IconPlus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading || !editData.title?.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>Update Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
