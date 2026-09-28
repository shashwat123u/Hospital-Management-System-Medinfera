import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { useSocket } from '../../hooks/useSocket';
import { notificationService } from '../../services/notificationService';

export const NotificationPanel = () => {
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notificationResponse } = useQuery({
    queryKey: ['notifications', 'header'],
    queryFn: async () => {
      const response = await notificationService.getAll({ page: 1, limit: 5, isRead: false });
      return response.data;
    },
  });
  const { data: unreadResponse } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await notificationService.getUnreadCount()).data.data,
  });
  const notifications = notificationResponse?.data || [];
  const unreadCount = unreadResponse?.unreadCount || 0;

  useEffect(() => {
    if (!socket) return undefined;
    const refreshNotifications = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
    socket.on('notification:new', refreshNotifications);
    return () => socket.off('notification:new', refreshNotifications);
  }, [socket, queryClient]);

  const markAsRead = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const trigger = (
    <div className="relative p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </div>
  );

  return (
    <Dropdown trigger={trigger} align="right">
      <div className="w-80 max-h-[400px] overflow-y-auto">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
          {isConnected && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Live" />}
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No new notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <DropdownItem 
              key={notif.id} 
              onClick={() => {
                if (!notif.isRead) markAsRead.mutate(notif.id);
                navigate('/notifications');
              }}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
            >
              <div className="flex flex-col gap-1 py-1">
                <span className="text-sm font-medium text-slate-800">{notif.title}</span>
                <span className="text-xs text-slate-500 line-clamp-2">{notif.message}</span>
                <span className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</span>
              </div>
            </DropdownItem>
          ))
        )}
        <DropdownItem onClick={() => navigate('/notifications')} className="justify-center border-t border-slate-100 text-center text-primary-700">
          View all notifications
        </DropdownItem>
      </div>
    </Dropdown>
  );
};
