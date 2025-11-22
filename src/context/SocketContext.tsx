'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

// Get API URL without /api suffix for WebSocket connection
const getSocketUrl = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? 'http://localhost:3001' : 'https://task-flow-api-alpha.vercel.app';
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Only connect if user is authenticated and has a token
    if (!user || !token) {
      return;
    }

    // Create socket connection
    const newSocket = io(getSocketUrl(), {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('[Socket] Socket error:', error.message);
    });

    newSocket.on('joined-board', ({ boardId }: { boardId: string }) => {
      console.log(`[Socket] Successfully joined board: ${boardId}`);
    });

    setSocket(newSocket);

    // Cleanup function handles disconnection properly
    return () => {
      console.log('[Socket] Cleaning up socket connection');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const joinBoard = useCallback((boardId: string) => {
    if (socket && isConnected) {
      socket.emit('join-board', boardId);
      console.log(`[Socket] Joined board: ${boardId}`);
    }
  }, [socket, isConnected]);

  const leaveBoard = useCallback((boardId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-board', boardId);
      console.log(`[Socket] Left board: ${boardId}`);
    }
  }, [socket, isConnected]);

  const contextValue: SocketContextType = useMemo(() => ({
    socket,
    isConnected,
    joinBoard,
    leaveBoard,
  }), [socket, isConnected, joinBoard, leaveBoard]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
