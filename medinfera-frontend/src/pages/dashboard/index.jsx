import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { AdminDashboard } from './AdminDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { NurseDashboard } from './NurseDashboard';
import { PharmacistDashboard } from './PharmacistDashboard';
import { LabTechDashboard } from './LabTechDashboard';
import { BillingDashboard } from './BillingDashboard';
import { StaffDashboard } from './StaffDashboard';
import { PatientDashboard } from './PatientDashboard';
import { DriverDashboard } from './DriverDashboard';

export const DashboardSelector = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'RECEPTIONIST':
      return <ReceptionistDashboard />;
    case 'NURSE':
      return <NurseDashboard />;
    case 'PHARMACIST':
      return <PharmacistDashboard />;
    case 'LAB_TECHNICIAN':
      return <LabTechDashboard />;
    case 'BILLING':
      return <BillingDashboard />;
    case 'STAFF':
      return <StaffDashboard />;
    case 'PATIENT':
      return <PatientDashboard />;
    case 'DRIVER':
      return <DriverDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-500">Dashboard not available for your role ({user?.role}).</p>
        </div>
      );
  }
};
