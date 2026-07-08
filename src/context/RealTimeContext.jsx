import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const RealTimeContext = createContext({});

export function useRealTime() {
  return useContext(RealTimeContext);
}

export function RealTimeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  // A generic event bus to allow components to listen without re-rendering everything
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    // Connect to the backend socket
    const socketInstance = io(import.meta.env.VITE_API_URL || 'https://taskpulseserverdesign-production.up.railway.app', {
      auth: { token },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('task:created', (data) => setLastEvent({ type: 'task:created', data }));
    socketInstance.on('task:updated', (data) => setLastEvent({ type: 'task:updated', data }));
    socketInstance.on('task:deleted', (data) => setLastEvent({ type: 'task:deleted', data }));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <RealTimeContext.Provider value={{ socket, lastEvent }}>
      {children}
    </RealTimeContext.Provider>
  );
}
