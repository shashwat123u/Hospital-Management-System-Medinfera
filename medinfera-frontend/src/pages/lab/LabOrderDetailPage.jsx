import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Microscope, FileText, User, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { labService } from '../../services/labService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';

export const LabOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['lab-orders', id],
    queryFn: async () => {
      const res = await labService.getOrderById(id);
      return res.data;
    }
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const breadcrumbs = [
    { label: 'Lab Orders', path: '/lab/orders' },
    { label: order?.orderNumber || 'Order Details' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title={`Lab Order #${order?.orderNumber || id.slice(-8)}`} 
        description="Detailed view of diagnostic test request and results."
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Microscope className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{order?.testName || order?.test?.name}</h3>
                </div>
                <StatusBadge status={order?.status} />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Requested By</p>
                    <p className="text-sm font-semibold text-slate-800">Dr. {order?.doctor?.user?.firstName} {order?.doctor?.user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Date Requested</p>
                    <p className="text-sm font-semibold text-slate-800">{format(new Date(order?.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Instructions / Clinical Info</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {order?.instructions || 'No specific instructions provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                Test Results
              </h4>

              {order?.status === 'COMPLETED' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {order?.results?.map((result, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase">{result.parameter}</p>
                          <p className="text-lg font-bold text-slate-900">{result.value} <span className="text-sm font-normal text-slate-400">{result.unit}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Reference Range</p>
                          <p className="text-sm font-medium text-slate-600">{result.referenceRange}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Technician's Observations</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{order?.observations || 'No observations recorded.'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h5 className="font-semibold text-slate-900">Results Pending</h5>
                  <p className="text-sm text-slate-500 max-w-[250px] mt-2">
                    The lab is currently processing this order. Results will appear here once finalized.
                  </p>
                  {order?.status === 'PENDING' && (
                    <Button 
                      variant="secondary" 
                      className="mt-6" 
                      onClick={() => navigate(`/lab/orders/${id}/results`)}
                      icon={CheckCircle2}
                    >
                      Process Results
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                Patient Info
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                    {order?.patient?.user?.firstName[0]}{order?.patient?.user?.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order?.patient?.user?.firstName} {order?.patient?.user?.lastName}</p>
                    <p className="text-xs text-slate-500">{order?.patient?.age}y | {order?.patient?.gender}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-medium">Patient ID</span>
                    <span className="text-slate-600 font-bold">#{order?.patient?.id?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-medium">Blood Group</span>
                    <span className="text-red-500 font-bold">{order?.patient?.bloodGroup}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full" icon={FileText}>Download Lab Report (PDF)</Button>
        </div>
      </div>
    </div>
  );
};
