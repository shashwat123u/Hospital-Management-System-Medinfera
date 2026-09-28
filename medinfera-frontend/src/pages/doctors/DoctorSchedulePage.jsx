import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/shared/StatusBadge';

export const DoctorSchedulePage = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: doctor, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['doctors', id],
    queryFn: async () => {
      const res = await doctorService.getById(id);
      return res.data.data;
    }
  });

  const { data: slots, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['doctors', id, 'slots', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await doctorService.getSlots(id, format(selectedDate, 'yyyy-MM-dd'));
      return res.data.data.slots;
    }
  });

  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ['doctors', id, 'schedule', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await doctorService.getSchedule(id, format(selectedDate, 'yyyy-MM-dd'));
      return res.data.data;
    }
  });

  const handleDateChange = (days) => {
    setSelectedDate(prev => addDays(prev, days));
  };

  if (isDoctorLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Doctors', path: '/doctors' },
    { label: doctor?.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'Doctor', path: `/doctors/${id}` },
    { label: 'Schedule' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Doctor Schedule" 
        description={`Manage availability and view appointments for Dr. ${doctor?.user?.lastName}`}
        breadcrumbs={breadcrumbs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Date Selector & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800">Select Date</h3>
              <div className="flex gap-1">
                <Button variant="secondary" size="sm" onClick={() => handleDateChange(-1)} icon={ChevronLeft} />
                <Button variant="secondary" size="sm" onClick={() => handleDateChange(1)} icon={ChevronRight} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary-50 text-primary-700 rounded-xl border border-primary-100">
                <CalendarIcon className="w-5 h-5" />
                <span className="font-medium">{format(selectedDate, 'EEEE, dd MMMM yyyy')}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Scheduled Appointments</span>
                  <span className="font-semibold text-slate-900">{appointments?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Available Slots</span>
                  <span className="font-semibold text-emerald-600">{slots?.filter(slot => slot.available).length || 0}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Available Time Slots
            </h3>
            {isSlotsLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots?.map((slot, i) => (
                  <div 
                    key={i} 
                    className={`text-center py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                      slot.available
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Appointments Timeline */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Today's Appointments
            </h3>

            {isAppointmentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : appointments?.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg px-3 py-2 min-w-[80px]">
                      <span className="text-sm font-bold text-slate-900">{appointment.appointmentTime}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-medium">Token {appointment.tokenNumber}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </h4>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{appointment.chiefComplaint || 'General Consultation'}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-medium">No Appointments</h4>
                <p className="text-sm text-slate-500 max-w-[200px] mt-1">
                  There are no appointments scheduled for this date.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
