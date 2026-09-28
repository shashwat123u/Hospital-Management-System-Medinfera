import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, AlertTriangle, IndianRupee,
  Activity, ArrowRight, ClipboardList, Plus
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

export const PharmacistDashboard = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Medicines', value: stats?.totalMedicines || 0, icon: Package, color: 'bg-blue-50 text-blue-600', link: '/medicines' },
    { label: 'Low Stock', value: stats?.lowStockCount || 0, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600', link: '/medicines/low-stock' },
    { label: 'Today Dispensed', value: stats?.todayDispensed || 0, icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600', link: '/prescriptions' },
    { label: 'Today Revenue', value: `₹${Number(stats?.todayRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-primary-50 text-primary-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pharmacy Overview</h1>
        <p className="text-slate-500 mt-1">Monitor inventory levels and dispensing activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const content = (
            <Card className={`p-6 ${stat.link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
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
          );
          return stat.link ? <Link key={i} to={stat.link}>{content}</Link> : <div key={i}>{content}</div>;
        })}
      </div>

      <Card className="p-6 border-amber-100 bg-amber-50/30">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-slate-900">Inventory Alerts</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{stats?.alerts?.lowStock || 0}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Low Stock</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{stats?.alerts?.expiringSoon || 0}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Expiring Soon</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/medicines">
          <Card className="p-6 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">View Inventory</p>
                  <p className="text-sm text-slate-500">Check stock levels and batch details.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </Card>
        </Link>

        <Link to="/prescriptions">
          <Card className="p-6 hover:bg-slate-50 transition-colors group border-primary-100 bg-primary-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-primary-900">Review Prescriptions</p>
                  <p className="text-sm text-primary-700">Select a prescription to dispense.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary-300 group-hover:text-primary-600 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
