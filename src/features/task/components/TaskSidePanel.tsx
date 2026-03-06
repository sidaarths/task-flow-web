'use client';

import { useState, useEffect, useRef } from 'react';
import {
  IconX,
  IconCalendar,
  IconTag,
  IconUser,
  IconUserPlus,
  IconUserMinus,
  IconTrash,
  IconLoader2,
} from '@tabler/icons-react';
import type { Task, User } from '@/types';
import { taskApi } from '@/features/task/api/task';
import { useBoardCacheUpdater } from '@/hooks/useBoard';

interface TaskSidePanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  boardMembers: User[];
  listTitle: string;
  boardId: string;
}

export default function TaskSidePanel({
  task,
  isOpen,
  onClose,
  boardMembers,
  listTitle,
  boardId,
}: TaskSidePanelProps) {
  const updater = useBoardCacheUpdater(boardId);

  // Editing state
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [dueDate, setDueDate] = useState('');

  // UI state
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);
  const memberPickerRef = useRef<HTMLDivElement>(null);

  // Sync state from task prop when not actively editing (handles SSE live updates)
  useEffect(() => {
    if (!task) return;
    if (editingField !== 'title') setTitleInput(task.title);
    if (editingField !== 'description') setDescInput(task.description ?? '');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  }, [task?.title, task?.description, task?.dueDate]);

  // Reset transient UI whenever the panel opens (same task or different task)
  useEffect(() => {
    if (task && isOpen) {
      setEditingField(null);
      setShowMemberPicker(false);
      setShowDeleteConfirm(false);
      setLabelInput('');
    }
  }, [task?._id, isOpen]);

  // Escape key closes the panel
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Close member picker on outside click
  useEffect(() => {
    if (!showMemberPicker) return;
    const handler = (e: MouseEvent) => {
      if (memberPickerRef.current && !memberPickerRef.current.contains(e.target as Node)) {
        setShowMemberPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMemberPicker]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingField === 'title') titleInputRef.current?.focus();
    if (editingField === 'description') descInputRef.current?.focus();
  }, [editingField]);

  if (!task) return null;

  const assignedMembers = boardMembers.filter((m) => task.assignedTo.includes(m._id));
  const unassignedMembers = boardMembers.filter((m) => !task.assignedTo.includes(m._id));

  const formatDateFull = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDateObj && dueDateObj < new Date();
  const isToday = dueDateObj && dueDateObj.toDateString() === new Date().toDateString();

  // ── Save handlers ──────────────────────────────────────────────────────────

  const saveTitle = async () => {
    setEditingField(null);
    const newTitle = titleInput.trim();
    if (!newTitle || newTitle === task.title) return;
    setSavingField('title');
    try {
      const updated = await taskApi.updateTask(task._id, { title: newTitle });
      updater.updateTask(updated);
    } catch {
      setTitleInput(task.title); // revert on error
    } finally {
      setSavingField(null);
    }
  };

  const saveDescription = async () => {
    setEditingField(null);
    const newDesc = descInput.trim();
    if (newDesc === (task.description ?? '')) return;
    setSavingField('description');
    try {
      const updated = await taskApi.updateTask(task._id, { description: newDesc });
      updater.updateTask(updated);
    } catch {
      setDescInput(task.description ?? '');
    } finally {
      setSavingField(null);
    }
  };

  const saveDueDate = async (value: string) => {
    setDueDate(value);
    setSavingField('dueDate');
    try {
      const updated = await taskApi.updateTask(task._id, { dueDate: value || null });
      updater.updateTask(updated);
    } catch {
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    } finally {
      setSavingField(null);
    }
  };

  const addLabel = async () => {
    const label = labelInput.trim();
    if (!label || task.labels.includes(label)) {
      setLabelInput('');
      return;
    }
    setSavingField('labels');
    setLabelInput('');
    try {
      const updated = await taskApi.updateTask(task._id, { labels: [...task.labels, label] });
      updater.updateTask(updated);
    } finally {
      setSavingField(null);
    }
  };

  const removeLabel = async (label: string) => {
    setSavingField('labels');
    try {
      const updated = await taskApi.updateTask(task._id, {
        labels: task.labels.filter((l) => l !== label),
      });
      updater.updateTask(updated);
    } finally {
      setSavingField(null);
    }
  };

  const assignMember = async (userId: string) => {
    setShowMemberPicker(false);
    try {
      const updated = await taskApi.assignUser(task._id, userId);
      updater.updateTask(updated);
    } catch (err) {
      console.error('Failed to assign user:', err);
    }
  };

  const unassignMember = async (userId: string) => {
    try {
      const updated = await taskApi.unassignUser(task._id, userId);
      updater.updateTask(updated);
    } catch (err) {
      console.error('Failed to unassign user:', err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(task._id);
      updater.removeTask(task._id);
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[480px] max-w-full bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200/60 dark:border-gray-700/60 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60 flex-shrink-0">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
            {listTitle}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Title
              </span>
              {savingField === 'title' && (
                <IconLoader2 className="w-3 h-3 text-blue-500 animate-spin" />
              )}
            </div>
            {editingField === 'title' ? (
              <input
                ref={titleInputRef}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') {
                    setTitleInput(task.title);
                    setEditingField(null);
                  }
                }}
                className="w-full text-lg font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-blue-500 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            ) : (
              <h2
                onClick={() => {
                  setTitleInput(task.title);
                  setEditingField('title');
                }}
                className="text-lg font-semibold text-gray-900 dark:text-white cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 py-2 -mx-3 transition-colors duration-150"
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Description
              </span>
              {savingField === 'description' && (
                <IconLoader2 className="w-3 h-3 text-blue-500 animate-spin" />
              )}
            </div>
            {editingField === 'description' ? (
              <textarea
                ref={descInputRef}
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                onBlur={saveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setDescInput(task.description ?? '');
                    setEditingField(null);
                  }
                }}
                rows={5}
                placeholder="Add a description…"
                className="w-full text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-blue-500 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
              />
            ) : (
              <div
                onClick={() => {
                  setDescInput(task.description ?? '');
                  setEditingField('description');
                }}
                className="text-sm text-gray-700 dark:text-gray-300 cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 py-2 -mx-3 min-h-[80px] transition-colors duration-150 whitespace-pre-wrap"
                title="Click to edit"
              >
                {task.description || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    No description — click to add one
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <IconCalendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Due Date
              </span>
              {savingField === 'dueDate' && (
                <IconLoader2 className="w-3 h-3 text-blue-500 animate-spin" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => saveDueDate(e.target.value)}
                className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              />
              {task.dueDate && (
                <>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isOverdue
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : isToday
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isOverdue ? 'Overdue' : isToday ? 'Due today' : formatDateFull(task.dueDate)}
                  </span>
                  <button
                    onClick={() => saveDueDate('')}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <IconTag className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Labels
              </span>
              {savingField === 'labels' && (
                <IconLoader2 className="w-3 h-3 text-blue-500 animate-spin" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                >
                  {label}
                  <button
                    onClick={() => removeLabel(label)}
                    className="hover:text-red-500 transition-colors ml-0.5"
                  >
                    <IconX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLabel();
                  }
                }}
                placeholder="Add label…"
                className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={addLabel}
                disabled={!labelInput.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Assigned Members */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <IconUser className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Assigned To
              </span>
            </div>
            <div className="space-y-2">
              {assignedMembers.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic px-1">
                  No members assigned
                </p>
              )}
              {assignedMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {member.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{member.email}</span>
                  </div>
                  <button
                    onClick={() => unassignMember(member._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove assignment"
                  >
                    <IconUserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Assign member button + dropdown */}
              {unassignedMembers.length > 0 && (
                <div className="relative" ref={memberPickerRef}>
                  <button
                    onClick={() => setShowMemberPicker((v) => !v)}
                    className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-1 px-1"
                  >
                    <IconUserPlus className="w-4 h-4" />
                    Assign member
                  </button>
                  {showMemberPicker && (
                    <div className="absolute left-0 top-9 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200/60 dark:border-gray-600/60 py-1 z-10 min-w-[260px]">
                      {unassignedMembers.map((member) => (
                        <button
                          key={member._id}
                          onClick={() => assignMember(member._id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-left transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                            {member.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {member.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/60 dark:border-gray-600/60">
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Created</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {formatDateFull(task.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Updated</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {formatDateFull(task.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — Delete */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/60">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                Delete this task?
              </span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <IconTrash className="w-3.5 h-3.5" />
                )}
                Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg px-3 py-2 -mx-3 transition-colors w-full"
            >
              <IconTrash className="w-4 h-4" />
              Delete task
            </button>
          )}
        </div>
      </div>
    </>
  );
}
