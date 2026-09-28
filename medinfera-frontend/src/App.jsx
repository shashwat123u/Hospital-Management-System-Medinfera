import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleGuard } from './components/guards/RoleGuard';

import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { DashboardSelector } from './pages/dashboard';

import { HospitalListPage } from './pages/hospitals/HospitalListPage';
import { HospitalDetailPage } from './pages/hospitals/HospitalDetailPage';
import { HospitalFormPage } from './pages/hospitals/HospitalFormPage';
import { UserListPage } from './pages/users/UserListPage';
import { UserFormPage } from './pages/users/UserFormPage';
import { DoctorListPage } from './pages/doctors/DoctorListPage';
import { DoctorDetailPage } from './pages/doctors/DoctorDetailPage';
import { DoctorSchedulePage } from './pages/doctors/DoctorSchedulePage';
import { DoctorRegistrationPage } from './pages/doctors/DoctorRegistrationPage';
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { PatientRegistrationPage } from './pages/patients/PatientRegistrationPage';
import { MedicalHistoryPage } from './pages/patients/MedicalHistoryPage';
import { AppointmentListPage } from './pages/appointments/AppointmentListPage';
import { AppointmentDetailPage } from './pages/appointments/AppointmentDetailPage';
import { BookAppointmentPage } from './pages/appointments/BookAppointmentPage';
import { WardListPage } from './pages/beds/WardListPage';
import { BedMapPage } from './pages/beds/BedMapPage';
import { BedStatsPage } from './pages/beds/BedStatsPage';
import { IpdListPage } from './pages/ipd/IpdListPage';
import { IpdDetailPage } from './pages/ipd/IpdDetailPage';
import { AdmitPatientPage } from './pages/ipd/AdmitPatientPage';
import { PrescriptionListPage } from './pages/prescriptions/PrescriptionListPage';
import { PrescriptionDetailPage } from './pages/prescriptions/PrescriptionDetailPage';
import { CreatePrescriptionPage } from './pages/prescriptions/CreatePrescriptionPage';
import { DispensePage } from './pages/prescriptions/DispensePage';
import { MedicineListPage } from './pages/medicines/MedicineListPage';
import { AddMedicinePage } from './pages/medicines/AddMedicinePage';
import { LowStockPage } from './pages/medicines/LowStockPage';
import { SupplierListPage } from './pages/medicines/SupplierListPage';
import { PurchaseOrderPage } from './pages/medicines/PurchaseOrderPage';
import { LabOrderListPage } from './pages/lab/LabOrderListPage';
import { LabOrderDetailPage } from './pages/lab/LabOrderDetailPage';
import { CreateLabOrderPage } from './pages/lab/CreateLabOrderPage';
import { TestCatalogPage } from './pages/lab/TestCatalogPage';
import { EnterResultsPage } from './pages/lab/EnterResultsPage';
import { InvoiceListPage } from './pages/invoices/InvoiceListPage';
import { InvoiceDetailPage } from './pages/invoices/InvoiceDetailPage';
import { CreateInvoicePage } from './pages/invoices/CreateInvoicePage';
import { PaymentHistoryPage } from './pages/invoices/PaymentHistoryPage';
import { AmbulanceListPage } from './pages/ambulance/AmbulanceListPage';
import { DispatchPage } from './pages/ambulance/DispatchPage';
import { TrackingPage } from './pages/ambulance/TrackingPage';
import { PayrollPage } from './pages/payouts/PayrollPage';
import { PayoutsPage } from './pages/payouts/PayoutsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN', 'BILLING', 'PATIENT', 'DRIVER', 'STAFF'];
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
const CLINICAL_STAFF = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'BILLING', 'STAFF'];
const PATIENT_STAFF = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'BILLING', 'PHARMACIST', 'LAB_TECHNICIAN', 'STAFF', 'DRIVER'];
const BED_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'BILLING'];
const LAB_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'NURSE', 'BILLING'];
const BILLING_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BILLING', 'RECEPTIONIST'];
const AMBULANCE_VIEW_ROLES = ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'DRIVER', 'NURSE'];
const guard = (allowedRoles, element) => <RoleGuard allowedRoles={allowedRoles}>{element}</RoleGuard>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardSelector /> },
      
      { path: 'hospitals', element: guard(['SUPER_ADMIN'], <HospitalListPage />) },
      { path: 'hospitals/new', element: guard(['SUPER_ADMIN'], <HospitalFormPage />) },
      { path: 'hospitals/:id', element: guard(['SUPER_ADMIN', 'ADMIN'], <HospitalDetailPage />) },
      
      { path: 'users', element: guard(ADMIN_ROLES, <UserListPage />) },
      { path: 'users/new', element: guard(ADMIN_ROLES, <UserFormPage />) },
      
      { path: 'doctors', element: guard(['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'NURSE', 'BILLING'], <DoctorListPage />) },
      { path: 'doctors/register', element: guard(ADMIN_ROLES, <DoctorRegistrationPage />) },
      { path: 'doctors/:id', element: guard(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'], <DoctorDetailPage />) },
      { path: 'doctors/:id/schedule', element: guard(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'], <DoctorSchedulePage />) },
      
      { path: 'patients', element: guard(PATIENT_STAFF, <PatientListPage />) },
      { path: 'patients/register', element: guard(['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'], <PatientRegistrationPage />) },
      { path: 'patients/:id', element: guard(PATIENT_STAFF, <PatientDetailPage />) },
      { path: 'patients/:id/history', element: guard(PATIENT_STAFF, <MedicalHistoryPage />) },
      
      { path: 'appointments', element: guard([...CLINICAL_STAFF, 'PATIENT'], <AppointmentListPage />) },
      { path: 'appointments/book', element: guard(['ADMIN', 'RECEPTIONIST', 'DOCTOR'], <BookAppointmentPage />) },
      { path: 'appointments/:id', element: guard([...CLINICAL_STAFF, 'PATIENT'], <AppointmentDetailPage />) },
      
      { path: 'beds/wards', element: guard(BED_VIEW_ROLES, <WardListPage />) },
      { path: 'beds', element: guard(BED_VIEW_ROLES, <BedMapPage />) },
      { path: 'beds/stats', element: guard(['SUPER_ADMIN', 'ADMIN', 'NURSE', 'DOCTOR'], <BedStatsPage />) },
      
      { path: 'ipd', element: guard([...CLINICAL_STAFF, 'BILLING'], <IpdListPage />) },
      { path: 'ipd/admit', element: guard(['ADMIN', 'RECEPTIONIST', 'DOCTOR'], <AdmitPatientPage />) },
      { path: 'ipd/:id', element: guard([...CLINICAL_STAFF, 'BILLING'], <IpdDetailPage />) },
      
      { path: 'medicines', element: guard(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'DOCTOR', 'NURSE'], <MedicineListPage />) },
      { path: 'medicines/new', element: guard(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'], <AddMedicinePage />) },
      { path: 'medicines/low-stock', element: guard(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'], <LowStockPage />) },
      { path: 'medicines/suppliers', element: guard(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'], <SupplierListPage />) },
      { path: 'medicines/purchase-orders', element: guard(['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'], <PurchaseOrderPage />) },
      
      { path: 'prescriptions', element: guard(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PHARMACIST', 'NURSE'], <PrescriptionListPage />) },
      { path: 'prescriptions/:id', element: guard(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PHARMACIST', 'NURSE', 'PATIENT'], <PrescriptionDetailPage />) },
      { path: 'prescriptions/create', element: guard(['DOCTOR'], <CreatePrescriptionPage />) },
      { path: 'prescriptions/:id/dispense', element: guard(['PHARMACIST', 'ADMIN'], <DispensePage />) },
      
      { path: 'lab/orders', element: guard(LAB_VIEW_ROLES, <LabOrderListPage />) },
      { path: 'lab/orders/new', element: guard(['DOCTOR', 'ADMIN', 'RECEPTIONIST'], <CreateLabOrderPage />) },
      { path: 'lab/orders/:id', element: guard(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'NURSE', 'PATIENT'], <LabOrderDetailPage />) },
      { path: 'lab/orders/:id/results', element: guard(['LAB_TECHNICIAN', 'ADMIN'], <EnterResultsPage />) },
      { path: 'lab/tests', element: guard(['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'RECEPTIONIST'], <TestCatalogPage />) },
      
      { path: 'billing/invoices', element: guard([...BILLING_ROLES, 'DOCTOR'], <InvoiceListPage />) },
      { path: 'billing/invoices/create', element: guard(BILLING_ROLES, <CreateInvoicePage />) },
      { path: 'billing/invoices/:id', element: guard([...BILLING_ROLES, 'DOCTOR', 'PATIENT'], <InvoiceDetailPage />) },
      { path: 'billing/invoices/payments', element: guard(BILLING_ROLES, <PaymentHistoryPage />) },
      
      { path: 'ambulance', element: guard(AMBULANCE_VIEW_ROLES, <AmbulanceListPage />) },
      { path: 'ambulance/dispatch', element: guard(['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'], <DispatchPage />) },
      { path: 'ambulance/tracking', element: guard(AMBULANCE_VIEW_ROLES, <TrackingPage />) },
      
      { path: 'payroll', element: guard(ADMIN_ROLES, <PayrollPage />) },
      { path: 'payouts', element: guard(ADMIN_ROLES, <PayoutsPage />) },
      
      { path: 'notifications', element: guard(ALL_ROLES, <NotificationsPage />) },
      { path: 'settings/password', element: guard(ALL_ROLES, <ChangePasswordPage />) },
    ],
  },
  {
    path: '/403',
    element: <div className="flex h-screen items-center justify-center"><h1 className="text-2xl font-bold">403 - Forbidden</h1></div>
  },
  {
    path: '*',
    element: <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center"><h1 className="text-2xl font-bold text-slate-900">Page not found</h1><p className="text-slate-500">The page you requested does not exist.</p><Link className="font-medium text-primary-700 hover:text-primary-800" to="/">Return to dashboard</Link></div>
  }
]);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
