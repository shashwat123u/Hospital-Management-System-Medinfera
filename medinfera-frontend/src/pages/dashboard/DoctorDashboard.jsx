import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, Users, FileText, Activity, ChevronRight, Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data?.data || {};
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const statCards = [
    { 
      label: "Today's Appointments", 
      value: stats?.todayAppointments || 0, 
      icon: Calendar, 
      color: "bg-blue-50 text-blue-600",
      link: "/appointments"
    },
    { 
      label: "Confirmed Appointments", 
      value: stats?.pendingRequests || 0, 
      icon: FileText, 
      color: "bg-amber-50 text-amber-600",
      link: "/prescriptions"
    },
    { 
      label: "Total Patients", 
      value: stats?.totalPatients || 0, 
      icon: Users, 
      color: "bg-emerald-50 text-emerald-600",
      link: "/patients"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, Dr. {user?.firstName} 👋</h1>
        <p className="text-slate-500 mt-1">Here's your schedule and patient summary for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Link key={i} to={stat.link}>
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-900">Today's Schedule</h2>
            <Link to="/appointments">
              <Button variant="ghost" size="sm">View All <ChevronRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats?.todaySchedule?.length > 0 ? (
              stats.todaySchedule.map((appt, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                      {appt.patientName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{appt.patientName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{appt.time}</span>
                        <span className="text-slate-300">•</span>
                        <span className="uppercase">{appt.type}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={appt.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {appt.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-6 bg-primary-900 text-white border-none overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Quick Prescribe</h3>
              <p className="text-primary-100 text-sm mb-6">Create e-prescriptions for your walk-in patients instantly.</p>
              <Link to="/prescriptions/create">
                <Button className="w-full bg-white text-primary-900 hover:bg-primary-50 border-none font-bold">
                  Open Prescription Builder
                </Button>
              </Link>
            </div>
            <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          </Card>

        </div>
      </div>
    </div>
  );
};
