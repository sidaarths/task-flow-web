'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import Pusher, { Channel } from 'pusher-js';
import { useAuth } from './AuthContext';
import { API_URL } from '@/config/apiConfig';

// Helper function to generate channel name
const getChannelName = (boardId: string): string => `private-board-${boardId}`;

interface SocketContextType {
  pusher: Pusher | null;
  isConnected: boolean;
  subscribeToBoard: (boardId: string) => Channel | null;
  unsubscribeFromBoard: (boardId: string) => void;
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

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  // Initialize Pusher connection
  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Only connect if user is authenticated
    if (!user || !token) {
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

    if (!pusherKey) {
      console.error('[Pusher] NEXT_PUBLIC_PUSHER_KEY not found');
      return;
    }

    // Create Pusher instance
    const pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: `${API_URL}/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Connection state handlers
    pusherInstance.connection.bind('connected', () => {
      console.log('[Pusher] Connected');
      setIsConnected(true);
    });

    pusherInstance.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected');
      setIsConnected(false);
    });

    pusherInstance.connection.bind('error', (error: unknown) => {
      console.error('[Pusher] Connection error:', error);
    });

    setPusher(pusherInstance);

    // Cleanup on unmount
    return () => {
      console.log('[Pusher] Disconnecting');
      pusherInstance.disconnect();
    };
  }, [user]);

  // Subscribe to a board channel
  const subscribeToBoard = useCallback(
    (boardId: string): Channel | null => {
      if (!pusher || !isConnected) {
        console.warn('[Pusher] Not connected');
        return null;
      }

      const channelName = getChannelName(boardId);

      // Check if already subscribed
      const existingChannel = pusher.channel(channelName);
      if (existingChannel) {
        console.log(`[Pusher] Already subscribed to ${channelName}`);
        return existingChannel;
      }

      // Subscribe to the channel
      const channel = pusher.subscribe(channelName);

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`[Pusher] Subscribed to ${channelName}`);
      });

      channel.bind('pusher:subscription_error', (error: unknown) => {
        console.error(`[Pusher] Subscription error for ${channelName}:`, error);
      });

      return channel;
    },
    [pusher, isConnected]
  );

  // Unsubscribe from a board channel
  const unsubscribeFromBoard = useCallback(
    (boardId: string) => {
      if (!pusher) {
        return;
      }

      const channelName = getChannelName(boardId);
      pusher.unsubscribe(channelName);
      console.log(`[Pusher] Unsubscribed from ${channelName}`);
    },
    [pusher]
  );

  const contextValue: SocketContextType = useMemo(
    () => ({
      pusher,
      isConnected,
      subscribeToBoard,
      unsubscribeFromBoard,
    }),
    [pusher, isConnected, subscribeToBoard, unsubscribeFromBoard]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
