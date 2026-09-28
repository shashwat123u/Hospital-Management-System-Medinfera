import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, AlertCircle, Info, Mail, Trash2, Clock } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { Badge } from '../../components/ui/Badge';

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { socket } = useSocket();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', { page }],
    queryFn: async () => {
      const res = await notificationService.getAll({ page, limit: 15 });
      return res.data;
    }
  });

  useEffect(() => {
    if (!socket) return undefined;
    const refreshNotifications = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
    socket.on('notification:new', refreshNotifications);
    return () => socket.off('notification:new', refreshNotifications);
  }, [socket, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Mail className="w-5 h-5 text-slate-400" />;
    }
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Notifications" 
        description="Stay updated with the latest system alerts and patient activities."
        actions={
          <Button 
            variant="secondary" 
            onClick={() => markAllReadMutation.mutate()} 
            isLoading={markAllReadMutation.isPending}
            disabled={!data?.pagination?.unreadCount}
          >
            Mark All as Read
          </Button>
        }
      />

      {data?.pagination?.unreadCount > 0 && <Badge variant="info">{data.pagination.unreadCount} unread</Badge>}

      <div className="space-y-3">
        {isError ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Notifications could not be loaded.</p> : data?.data?.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all hover:border-primary-200 ${!notification.isRead ? 'border-l-4 border-l-primary-600 bg-primary-50/30' : ''}`}
            onClick={() => !notification.isRead && markReadMutation.mutate(notification.id)}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notification.isRead ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm font-bold truncate ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                    {notification.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 whitespace-nowrap ml-4">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <p className={`text-sm mt-1 line-clamp-2 ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                  {notification.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {data?.data?.length === 0 && !isLoading && !isError && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
            <p className="text-sm text-slate-500 mt-1">You have no new notifications at the moment.</p>
          </div>
        )}
      </div>

      {data?.pagination?.totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
