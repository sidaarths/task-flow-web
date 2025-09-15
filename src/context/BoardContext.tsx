'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import type {
  BoardWithListsAndTasks,
  List,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@/types';
import { boardApi } from '@/features/board/api/board';
import { listApi } from '@/features/list/api/list';
import { taskApi } from '@/features/task/api/task';

interface BoardState {
  boardData: BoardWithListsAndTasks | null;
  loading: boolean;
  error: string;
}

type BoardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_BOARD_DATA'; payload: BoardWithListsAndTasks }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: List }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_BOARD_MEMBERS'; payload: string[] }
  | { type: 'REMOVE_BOARD_MEMBER'; payload: string };

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BOARD_DATA':
      return { ...state, boardData: action.payload, loading: false, error: '' };
    case 'ADD_LIST':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          lists: [...state.boardData.lists, action.payload],
        },
      };
    case 'UPDATE_LIST':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          lists: state.boardData.lists.map((list) =>
            list._id === action.payload._id ? action.payload : list
          ),
        },
      };
    case 'DELETE_LIST':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          lists: state.boardData.lists.filter(
            (list) => list._id !== action.payload
          ),
          tasks: state.boardData.tasks.filter(
            (task) => task.listId !== action.payload
          ),
        },
      };
    case 'ADD_TASK':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          tasks: [...state.boardData.tasks, action.payload],
        },
      };
    case 'UPDATE_TASK':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          tasks: state.boardData.tasks.map((task) =>
            task._id === action.payload._id ? action.payload : task
          ),
        },
      };
    case 'DELETE_TASK':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          tasks: state.boardData.tasks.filter(
            (task) => task._id !== action.payload
          ),
        },
      };
    case 'ADD_BOARD_MEMBERS':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          board: {
            ...state.boardData.board,
            members: [...state.boardData.board.members, ...action.payload],
          },
        },
      };
    case 'REMOVE_BOARD_MEMBER':
      if (!state.boardData) return state;
      return {
        ...state,
        boardData: {
          ...state.boardData,
          board: {
            ...state.boardData.board,
            members: state.boardData.board.members.filter(
              (id) => id !== action.payload
            ),
          },
        },
      };
    default:
      return state;
  }
};

interface BoardContextType {
  // State
  boardData: BoardWithListsAndTasks | null;
  loading: boolean;
  error: string;

  // Board actions
  fetchBoardData: (boardId: string) => Promise<void>;
  addBoardMembers: (boardId: string, userIds: string[]) => Promise<void>;
  removeBoardMember: (boardId: string, userId: string) => Promise<void>;

  // List actions
  createList: (boardId: string, title: string) => Promise<void>;
  updateList: (listId: string, title: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;

  // Task actions
  createTask: (listId: string, data: CreateTaskRequest) => Promise<void>;
  updateTask: (taskId: string, data: UpdateTaskRequest) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: React.ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, {
    boardData: null,
    loading: false,
    error: '',
  });

  // Board actions
  const fetchBoardData = useCallback(async (boardId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: '' });
      const data = await boardApi.getBoardWithListsAndTasks(boardId);
      dispatch({ type: 'SET_BOARD_DATA', payload: data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to fetch board data',
      });
    }
  }, []);

  const addBoardMembers = useCallback(
    async (boardId: string, userIds: string[]) => {
      try {
        // Invite each user individually as the API expects single user invites
        for (const userId of userIds) {
          await boardApi.inviteUserToBoard(boardId, userId);
        }
        dispatch({ type: 'ADD_BOARD_MEMBERS', payload: userIds });
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const removeBoardMember = useCallback(
    async (boardId: string, userId: string) => {
      try {
        await boardApi.removeMemberFromBoard(boardId, userId);
        dispatch({ type: 'REMOVE_BOARD_MEMBER', payload: userId });
      } catch (error) {
        throw error;
      }
    },
    []
  );

  // List actions
  const createList = useCallback(async (boardId: string, title: string) => {
    try {
      const newList = await boardApi.createList(boardId, { title });
      dispatch({ type: 'ADD_LIST', payload: newList });
    } catch (error) {
      throw error;
    }
  }, []);

  const updateList = useCallback(async (listId: string, title: string) => {
    try {
      const updatedList = await listApi.updateList(listId, { title });
      dispatch({ type: 'UPDATE_LIST', payload: updatedList });
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    try {
      await listApi.deleteList(listId);
      dispatch({ type: 'DELETE_LIST', payload: listId });
    } catch (error) {
      throw error;
    }
  }, []);

  // Task actions
  const createTask = useCallback(
    async (listId: string, data: CreateTaskRequest) => {
      try {
        const newTask = await listApi.createTask(listId, data);
        dispatch({ type: 'ADD_TASK', payload: newTask });
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (taskId: string, data: UpdateTaskRequest) => {
      try {
        const updatedTask = await taskApi.updateTask(taskId, data);
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (error) {
      throw error;
    }
  }, []);

  const contextValue: BoardContextType = {
    // State
    boardData: state.boardData,
    loading: state.loading,
    error: state.error,

    // Board actions
    fetchBoardData,
    addBoardMembers,
    removeBoardMember,

    // List actions
    createList,
    updateList,
    deleteList,

    // Task actions
    createTask,
    updateTask,
    deleteTask,
  };

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};
