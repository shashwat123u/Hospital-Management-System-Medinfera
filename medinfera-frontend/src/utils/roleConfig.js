import {
  LayoutDashboard, Building2, Users, Stethoscope, Settings,
  UserRound, CalendarCheck, BedDouble, Hotel, Pill, FlaskConical,
  Receipt, Ambulance, Banknote, Bell, PackageOpen, MapPin
} from 'lucide-react';

export const NAV_CONFIG = {
  SUPER_ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Hospitals', icon: Building2, path: '/hospitals' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
    { label: 'Settings', icon: Settings, path: '/settings/password' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
    { label: 'Patients', icon: UserRound, path: '/patients' },
    { label: 'Appointments', icon: CalendarCheck, path: '/appointments' },
    { label: 'IPD', icon: BedDouble, path: '/ipd' },
    { label: 'Beds & Wards', icon: Hotel, path: '/beds/wards' },
    { label: 'Pharmacy', icon: Pill, path: '/medicines' },
    { label: 'Laboratory', icon: FlaskConical, path: '/lab/orders' },
    { label: 'Billing', icon: Receipt, path: '/billing/invoices' },
    { label: 'Ambulance', icon: Ambulance, path: '/ambulance' },
    { label: 'Payroll', icon: Banknote, path: '/payroll' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  DOCTOR: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Patients', icon: UserRound, path: '/patients' },
    { label: 'Appointments', icon: CalendarCheck, path: '/appointments' },
    { label: 'IPD', icon: BedDouble, path: '/ipd' },
    { label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { label: 'Laboratory', icon: FlaskConical, path: '/lab/orders' },
  ],
  RECEPTIONIST: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Patients', icon: UserRound, path: '/patients' },
    { label: 'Appointments', icon: CalendarCheck, path: '/appointments' },
    { label: 'IPD', icon: BedDouble, path: '/ipd' },
    { label: 'Billing', icon: Receipt, path: '/billing/invoices' },
    { label: 'Ambulance', icon: Ambulance, path: '/ambulance' },
  ],
  NURSE: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Patients', icon: UserRound, path: '/patients' },
    { label: 'IPD', icon: BedDouble, path: '/ipd' },
    { label: 'Beds & Wards', icon: Hotel, path: '/beds/wards' },
  ],
  PHARMACIST: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Inventory', icon: PackageOpen, path: '/medicines' },
    { label: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { label: 'Suppliers', icon: Building2, path: '/medicines/suppliers' },
    { label: 'Purchase Orders', icon: Receipt, path: '/medicines/purchase-orders' },
  ],
  LAB_TECHNICIAN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Orders', icon: FlaskConical, path: '/lab/orders' },
    { label: 'Test Catalog', icon: PackageOpen, path: '/lab/tests' },
  ],
  BILLING: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Invoices', icon: Receipt, path: '/billing/invoices' },
    { label: 'Payments', icon: Banknote, path: '/billing/invoices/payments' },
  ],
  DRIVER: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Dispatches', icon: Ambulance, path: '/ambulance' },
    { label: 'Live Tracking', icon: MapPin, path: '/ambulance/tracking' },
  ],
  STAFF: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Patients', icon: UserRound, path: '/patients' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  PATIENT: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Appointments', icon: CalendarCheck, path: '/appointments' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Settings', icon: Settings, path: '/settings/password' },
  ]
};
