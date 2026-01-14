import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { addNotification } from '../store/notificationSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('register', user.id);
    });

    // Listen for hire notifications
    socket.on('hired', (data: { gigTitle: string }) => {
      dispatch(addNotification({
        message: `You have been hired for ${data.gigTitle}!`,
        type: 'success',
      }));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [user, dispatch]);

  return socketRef.current;
};
