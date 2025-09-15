'use client';

import { useState } from 'react';
import { IconX, IconPlus, IconTag, IconCheck } from '@tabler/icons-react';
import type { CreateTaskRequest } from '@/types';
import DatePicker from '@/components/DatePicker';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTaskRequest) => Promise<void>;
  listTitle: string;
}

export default function TaskCreateModal({
  isOpen,
  onClose,
  onCreate,
  listTitle,
}: TaskCreateModalProps) {
  interface TaskFormData {
    title: string;
    description?: string;
    labels: string[];
    dueDate: Date | null;
  }

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    labels: [],
    dueDate: null,
  });
  const [newLabel, setNewLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      labels: [],
      dueDate: null,
    });
    setNewLabel('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, newLabel.trim()],
      });
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((label) => label !== labelToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    try {
      setIsCreating(true);
      const createData: CreateTaskRequest = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        labels: formData.labels.length > 0 ? formData.labels : undefined,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : undefined,
      };

      await onCreate(createData);
      handleClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[98vh] overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-gray-600/60">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Task
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Adding to <span className="font-medium">{listTitle}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
              <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter task title"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Due Date */}
          <div>
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(date) => setFormData({ ...formData, dueDate: date })}
              placeholder="Select due date"
              minDate={new Date()}
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="space-y-3">
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.labels.map((label, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      <IconTag className="w-3 h-3" />
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add label"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addLabel())
                  }
                />
                <button
                  type="button"
                  onClick={addLabel}
                  disabled={!newLabel.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-200 flex items-center space-x-1"
                >
                  <IconPlus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200/60 dark:border-gray-600/60">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isCreating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <IconCheck className="w-4 h-4" />
              <span>{isCreating ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
