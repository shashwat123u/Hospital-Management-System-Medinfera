import React from 'react';
import { Badge } from '../ui/Badge';

export const RoleBadge = ({ role, className = '' }) => {
  const roleMap = {
    SUPER_ADMIN: { variant: 'danger', label: 'Super Admin' },
    ADMIN: { variant: 'primary', label: 'Admin' },
    DOCTOR: { variant: 'success', label: 'Doctor' },
    RECEPTIONIST: { variant: 'info', label: 'Receptionist' },
    NURSE: { variant: 'warning', label: 'Nurse' },
    PHARMACIST: { variant: 'primary', label: 'Pharmacist' },
    LAB_TECHNICIAN: { variant: 'info', label: 'Lab Tech' },
    BILLING: { variant: 'slate', label: 'Billing' },
    DRIVER: { variant: 'warning', label: 'Driver' },
  };

  const config = roleMap[role] || { variant: 'slate', label: role };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
