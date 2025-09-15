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
} from '@/types';
import { boardApi } from '@/features/board/api/board';

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
  setBoardData: (data: BoardWithListsAndTasks) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  // List actions
  addList: (list: List) => void;
  updateList: (list: List) => void;
  deleteList: (listId: string) => void;

  // Task actions
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;

  // Board member actions
  addBoardMembers: (userIds: string[]) => void;
  removeBoardMember: (userId: string) => void;
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

  const setBoardData = useCallback((data: BoardWithListsAndTasks) => {
    dispatch({ type: 'SET_BOARD_DATA', payload: data });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const addList = useCallback((list: List) => {
    dispatch({ type: 'ADD_LIST', payload: list });
  }, []);

  const updateList = useCallback((list: List) => {
    dispatch({ type: 'UPDATE_LIST', payload: list });
  }, []);

  const deleteList = useCallback((listId: string) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
  }, []);

  const addTask = useCallback((task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  const addBoardMembers = useCallback((userIds: string[]) => {
    dispatch({ type: 'ADD_BOARD_MEMBERS', payload: userIds });
  }, []);

  const removeBoardMember = useCallback((userId: string) => {
    dispatch({ type: 'REMOVE_BOARD_MEMBER', payload: userId });
  }, []);

  const contextValue: BoardContextType = {
    // State
    boardData: state.boardData,
    loading: state.loading,
    error: state.error,

    // Board actions
    fetchBoardData,
    setBoardData,
    setLoading,
    setError,

    // List actions
    addList,
    updateList,
    deleteList,

    // Task actions
    addTask,
    updateTask,
    deleteTask,

    // Board member actions
    addBoardMembers,
    removeBoardMember,
  };

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
};
