'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { useAuth } from './AuthContext';
import { API_URL } from '@/config/apiConfig';

interface SocketContextType {
  pusher: Pusher | null;
  isConnected: boolean;
  joinBoard: (boardId: string) => Channel | null;
  leaveBoard: (boardId: string) => void;
  currentChannel: Channel | null;
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
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Only connect if user is authenticated and has a token
    if (!user || !token) {
      return;
    }

    // Get Pusher key from environment variable
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

    if (!pusherKey) {
      console.error('[Pusher] NEXT_PUBLIC_PUSHER_KEY not found in environment variables');
      return;
    }

    // Create Pusher connection
    const pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: `${API_URL}/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    pusherInstance.connection.bind('connected', () => {
      console.log('[Pusher] Connected to Pusher');
      setIsConnected(true);
    });

    pusherInstance.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected from Pusher');
      setIsConnected(false);
    });

    pusherInstance.connection.bind('error', (error: unknown) => {
      console.error('[Pusher] Connection error:', error);
      setIsConnected(false);
    });

    setPusher(pusherInstance);

    // Cleanup function
    return () => {
      console.log('[Pusher] Cleaning up Pusher connection');
      pusherInstance.disconnect();
      setPusher(null);
      setIsConnected(false);
      setCurrentChannel(null);
    };
  }, [user]);

  const joinBoard = useCallback((boardId: string): Channel | null => {
    if (!pusher || !isConnected) {
      console.warn('[Pusher] Cannot join board: Pusher not connected');
      return null;
    }

    const channelName = `private-board-${boardId}`;
    
    // Check if already subscribed to this channel
    const existingChannel = pusher.channel(channelName);
    if (existingChannel && currentChannel?.name === channelName) {
      console.log(`[Pusher] Already subscribed to: ${channelName}`);
      return existingChannel;
    }
    
    // Unsubscribe from previous channel if exists
    if (currentChannel && currentChannel.name !== channelName) {
      pusher.unsubscribe(currentChannel.name);
      console.log(`[Pusher] Unsubscribed from: ${currentChannel.name}`);
    }

    // Subscribe to new channel
    const channel = pusher.subscribe(channelName);
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`[Pusher] Successfully subscribed to: ${channelName}`);
    });

    channel.bind('pusher:subscription_error', (error: unknown) => {
      console.error(`[Pusher] Subscription error for ${channelName}:`, error);
    });

    setCurrentChannel(channel);
    console.log(`[Pusher] Joined board: ${boardId}`);
    return channel;
  }, [pusher, isConnected, currentChannel]);

  const leaveBoard = useCallback((boardId: string) => {
    if (!pusher) {
      return;
    }

    const channelName = `private-board-${boardId}`;
    pusher.unsubscribe(channelName);
    
    if (currentChannel?.name === channelName) {
      setCurrentChannel(null);
    }
    
    console.log(`[Pusher] Left board: ${boardId}`);
  }, [pusher, currentChannel]);

  const contextValue: SocketContextType = useMemo(() => ({
    pusher,
    isConnected,
    joinBoard,
    leaveBoard,
    currentChannel,
  }), [pusher, isConnected, joinBoard, leaveBoard, currentChannel]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
