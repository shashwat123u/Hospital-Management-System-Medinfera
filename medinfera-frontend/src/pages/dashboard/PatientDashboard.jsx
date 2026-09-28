import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, FileText, CreditCard, Activity,
  Clock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const PatientDashboard = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'Upcoming', value: stats?.upcomingAppointments || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Prescriptions', value: stats?.prescriptions || 0, icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Payments', value: stats?.pendingPayments || 0, icon: CreditCard, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hello, {user?.firstName} 👋</h1>
        <p className="text-slate-500 mt-1">Here's your health overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-primary-900 text-white border-none overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Book an Appointment</h2>
            <p className="text-primary-100 max-w-md">Choose from 15+ doctors across specializations and get quality care today.</p>
          </div>
          <Link to="/appointments">
            <Button size="lg" className="bg-white text-primary-900 hover:bg-primary-50 border-none font-bold">
              View Appointments <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
        <Activity className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Upcoming Appointments</h3>
            <Link to="/appointments">
              <Button variant="ghost" size="sm">View All <ChevronRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats?.recentAppointments?.length > 0 ? (
              stats.recentAppointments.map((appt, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{appt.doctorName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(appt.date), 'MMM dd, yyyy')} at {appt.time}</p>
                    </div>
                  </div>
                  <Badge variant={appt.status === 'CONFIRMED' ? 'success' : 'warning'}>
                    {appt.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">No upcoming appointments.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Recent Prescriptions</h3>
            <Link to="/prescriptions">
              <Button variant="ghost" size="sm">View All <ChevronRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats?.recentPrescriptions?.length > 0 ? (
              stats.recentPrescriptions.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{p.doctorName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(p.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">No recent prescriptions.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-slate-50 border-none">
        <h3 className="font-bold text-slate-900 mb-4">My Health Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Blood Group</p>
            <p className="font-bold text-red-600">{stats?.profile?.bloodGroup || 'Not set'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Gender</p>
            <p className="font-bold text-slate-900">{stats?.profile?.gender || 'Not set'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Date of Birth</p>
            <p className="font-bold text-slate-900">
              {stats?.profile?.dob ? format(new Date(stats.profile.dob), 'yyyy-MM-dd') : 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Phone</p>
            <p className="font-bold text-slate-900">{stats?.profile?.phone || 'Not set'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
