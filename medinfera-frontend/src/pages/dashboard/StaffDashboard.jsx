import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Users } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { patientService } from '../../services/patientService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/shared/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';

export const StaffDashboard = () => {
  const { data: notificationsData, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ['dashboard', 'staff', 'notifications'],
    queryFn: async () => {
      const [notificationsRes, unreadRes] = await Promise.all([
        notificationService.getAll({ limit: 5 }),
        notificationService.getUnreadCount()
      ]);
      return {
        notifications: notificationsRes.data?.data || [],
        unreadCount: unreadRes.data?.data?.unreadCount || 0
      };
    }
  });

  const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
    queryKey: ['dashboard', 'staff', 'patients'],
    queryFn: async () => {
      const res = await patientService.getAll({ limit: 1 });
      return {
        totalPatients: res.data?.pagination?.total || 0
      };
    }
  });

  const columns = [
    { header: 'Time', cell: ({ row }) => row.original.createdAt ? format(new Date(row.original.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A' },
    { header: 'Message', accessorKey: 'message' },
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isRead ? 'READ' : 'UNREAD'} /> },
  ];

  const isLoading = isNotificationsLoading || isPatientsLoading;
  const recentActivity = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const totalPatients = patientsData?.totalPatients || 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Dashboard" description="Overview of your daily tasks and activities." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard title="Unread Notifications" value={unreadCount} icon={ClipboardList} color="primary" />
        <StatsCard title="Total Patients" value={totalPatients} icon={Users} color="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 && !isLoading ? (
            <div className="p-6">
              <EmptyState title="No recent activity" description="You have no recent notifications." />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={recentActivity} 
              isLoading={isLoading} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
