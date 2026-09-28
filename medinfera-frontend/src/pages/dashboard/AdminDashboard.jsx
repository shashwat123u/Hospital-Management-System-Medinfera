import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Calendar, Activity, IndianRupee, 
  ChevronRight, AlertCircle, Package, Stethoscope, UserRound, Contact
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { bedService } from '../../services/bedService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data?.data || {};
    }
  });

  const { data: bedStats } = useQuery({
    queryKey: ['beds', 'stats', 'admin-dashboard'],
    queryFn: async () => (await bedService.getStats()).data.data,
  });
  const occupancyRate = bedStats?.totals?.occupancyRate;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Patients', value: stats?.totalPatients || 0, icon: Users, color: 'bg-blue-50 text-blue-600', link: '/patients' },
    { label: 'Today Appointments', value: stats?.todayAppointments || 0, icon: Calendar, color: 'bg-emerald-50 text-emerald-600', link: '/appointments' },
    { label: 'Low Stock Items', value: stats?.lowStockMedicines || 0, icon: Package, color: 'bg-amber-50 text-amber-600', link: '/medicines/low-stock' },
    { label: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-primary-50 text-primary-600', link: '/billing/invoices' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Admin Dashboard" 
        description="Comprehensive overview of hospital operations and performance."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Link key={i} to={stat.link}>
            <Card className="p-6 hover:shadow-md transition-all cursor-pointer h-full">
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
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 flex flex-col space-y-8">
          {/* Hospital Activity Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-900">Hospital Activity</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="font-medium">Overview</Badge>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold text-slate-900">Active doctor accounts</p>
                    <span className="text-xs font-medium text-blue-600">{stats?.activeDoctors || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold text-slate-900">Bed occupancy</p>
                    <span className="text-xs font-medium text-emerald-600">{occupancyRate === undefined ? '—' : `${occupancyRate}%`}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${occupancyRate || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personnel Management Section */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-900">Personnel Oversight</h2>
              <Badge variant="secondary">Directory</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/doctors">
                <div className="flex flex-col items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary-200 transition-all text-center">
                  <Stethoscope className="w-6 h-6 text-primary-600 mb-2" />
                  <p className="text-sm font-bold text-slate-900">Doctors</p>
                  <p className="text-xs text-slate-500 mt-1">Manage doctor profiles</p>
                </div>
              </Link>
              <Link to="/patients">
                <div className="flex flex-col items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary-200 transition-all text-center">
                  <UserRound className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="text-sm font-bold text-slate-900">Patients</p>
                  <p className="text-xs text-slate-500 mt-1">View patient records</p>
                </div>
              </Link>
              <Link to="/users">
                <div className="flex flex-col items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary-200 transition-all text-center">
                  <Contact className="w-6 h-6 text-emerald-600 mb-2" />
                  <p className="text-sm font-bold text-slate-900">Staff & Users</p>
                  <p className="text-xs text-slate-500 mt-1">Manage staff roles</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Registration Actions */}
          <div className="pt-6 border-t border-slate-100">
            <h2 className="font-bold text-slate-900 mb-6">Quick Registration</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/users/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  + Register Staff
                </Button>
              </Link>
              <Link to="/patients/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  + Register Patient
                </Button>
              </Link>
              <Link to="/doctors/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  + Add Doctor
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-6">Critical Alerts</h2>
          <div className="space-y-4">
            {stats?.lowStockMedicines > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-900">Pharmacy Low Stock</p>
                  <p className="text-xs text-red-700 mt-0.5">{stats.lowStockMedicines} items are below reorder level.</p>
                </div>
              </div>
            )}
            
            {!stats?.lowStockMedicines && <p className="text-sm text-slate-500">No low-stock alerts.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
