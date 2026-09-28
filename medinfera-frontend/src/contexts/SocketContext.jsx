import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { ACCESS_TOKEN_UPDATED_EVENT, API_BASE_URL, getAccessToken } from '../services/api';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/v\d+$/, '');
    const newSocket = io(socketUrl, {
      auth: {
        token: getAccessToken()
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
    });

    const refreshSocketAuth = () => {
      newSocket.auth = { token: getAccessToken() };
      newSocket.disconnect();
      newSocket.connect();
    };
    window.addEventListener(ACCESS_TOKEN_UPDATED_EVENT, refreshSocketAuth);

    setSocket(newSocket);

    return () => {
      window.removeEventListener(ACCESS_TOKEN_UPDATED_EVENT, refreshSocketAuth);
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
