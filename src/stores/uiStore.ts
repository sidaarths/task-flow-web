import { create } from 'zustand';
import type { List, Task } from '@/types';

interface UIState {
  // Board page modal states
  showCreateListModal: boolean;
  showEditListModal: boolean;
  showDeleteListModal: boolean;
  showCreateTaskModal: boolean;
  showBoardMembersModal: boolean;

  // Selected entities
  selectedList: List | null;
  selectedTask: Task | null;

  // Drag-and-drop
  activeTask: Task | null;

  // Actions
  openModal: (
    modal:
      | 'showCreateListModal'
      | 'showEditListModal'
      | 'showDeleteListModal'
      | 'showCreateTaskModal'
      | 'showBoardMembersModal'
  ) => void;
  closeModal: (
    modal:
      | 'showCreateListModal'
      | 'showEditListModal'
      | 'showDeleteListModal'
      | 'showCreateTaskModal'
      | 'showBoardMembersModal'
  ) => void;
  setSelectedList: (list: List | null) => void;
  setSelectedTask: (task: Task | null) => void;
  setActiveTask: (task: Task | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showCreateListModal: false,
  showEditListModal: false,
  showDeleteListModal: false,
  showCreateTaskModal: false,
  showBoardMembersModal: false,
  selectedList: null,
  selectedTask: null,
  activeTask: null,
  openModal: (modal) => set({ [modal]: true }),
  closeModal: (modal) => set({ [modal]: false }),
  setSelectedList: (list) => set({ selectedList: list }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setActiveTask: (task) => set({ activeTask: task }),
}));
