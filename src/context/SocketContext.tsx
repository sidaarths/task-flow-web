'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Pusher, { Channel } from 'pusher-js';
import { useAuth } from './AuthContext';
import { API_URL } from '@/config/apiConfig';

// Helper function to generate channel name
const getChannelName = (boardId: string): string => `private-board-${boardId}`;

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

  // Use ref to track current channel name to avoid stale closures
  const currentChannelNameRef = useRef<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Only connect if user is authenticated and has a token
    if (!user || !token) {
      return;
    }

    // Get Pusher key from environment variable
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

    // Validate environment variables
    if (!pusherKey) {
      console.error(
        '[Pusher] NEXT_PUBLIC_PUSHER_KEY not found in environment variables'
      );
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

  const joinBoard = useCallback(
    (boardId: string): Channel | null => {
      if (!pusher || !isConnected) {
        console.warn('[Pusher] Cannot join board: Pusher not connected');
        return null;
      }

      const channelName = getChannelName(boardId);

      // Check if already subscribed using Pusher's channel method for reliability
      const existingChannel = pusher.channel(channelName);
      if (existingChannel) {
        console.log(`[Pusher] Already subscribed to: ${channelName}`);
        return existingChannel;
      }

      // Unsubscribe from previous channel if exists
      if (currentChannelNameRef.current) {
        const oldChannelName = currentChannelNameRef.current;
        const oldChannel = pusher.channel(oldChannelName);

        // Unbind all event listeners to prevent memory leaks
        if (oldChannel) {
          oldChannel.unbind_all();
        }

        pusher.unsubscribe(oldChannelName);
        console.log(`[Pusher] Unsubscribed from: ${oldChannelName}`);
      }

      // Subscribe to new channel
      const channel = pusher.subscribe(channelName);

      // Generate a unique ID for this subscription to prevent race conditions
      const subscriptionId = `${channelName}-${Date.now()}`;

      // Update ref immediately
      currentChannelNameRef.current = channelName;

      // Set channel to state immediately so event listeners can be bound
      setCurrentChannel(channel);

      // Handle subscription events for logging and error handling
      const handleSubscriptionSuccess = () => {
        console.log(`[Pusher] Successfully subscribed to: ${channelName}`);
        // Unbind this handler after it fires to prevent memory leaks
        channel.unbind(
          'pusher:subscription_succeeded',
          handleSubscriptionSuccess
        );
      };

      const handleSubscriptionError = (error: unknown) => {
        console.error(`[Pusher] Subscription error for ${channelName}:`, error);
        // Only clear the channel if this is still the current subscription
        // This prevents stale error handlers from clearing newer channel state
        if (currentChannelNameRef.current === channelName) {
          console.log(`[Pusher] Clearing failed channel: ${channelName}`);
          setCurrentChannel(null);
          currentChannelNameRef.current = null;
        } else {
          console.log(
            `[Pusher] Ignoring stale error for ${channelName} (current: ${currentChannelNameRef.current})`
          );
        }
        // Unbind this handler after it fires to prevent memory leaks
        channel.unbind('pusher:subscription_error', handleSubscriptionError);
      };

      channel.bind('pusher:subscription_succeeded', handleSubscriptionSuccess);
      channel.bind('pusher:subscription_error', handleSubscriptionError);

      console.log(
        `[Pusher] Joining board: ${boardId} (subscription: ${subscriptionId})`
      );
      return channel;
    },
    [pusher, isConnected]
  );

  const leaveBoard = useCallback(
    (boardId: string) => {
      if (!pusher) {
        return;
      }

      const channelName = getChannelName(boardId);
      const channel = pusher.channel(channelName);

      // Unbind all event listeners before unsubscribing to prevent memory leaks
      if (channel) {
        channel.unbind_all();
      }

      pusher.unsubscribe(channelName);

      // Update ref and state
      if (currentChannelNameRef.current === channelName) {
        currentChannelNameRef.current = null;
        setCurrentChannel(null);
      }

      console.log(`[Pusher] Left board: ${boardId}`);
    },
    [pusher]
  );

  const contextValue: SocketContextType = useMemo(
    () => ({
      pusher,
      isConnected,
      joinBoard,
      leaveBoard,
      currentChannel,
    }),
    [pusher, isConnected, joinBoard, leaveBoard, currentChannel]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
