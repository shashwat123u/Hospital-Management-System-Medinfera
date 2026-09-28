import React from 'react';
import { Badge } from '../ui/Badge';

export const StatusBadge = ({ status, className = '' }) => {
  const statusMap = {
    // Appointment
    SCHEDULED: { variant: 'info', label: 'Scheduled' },
    CONFIRMED: { variant: 'primary', label: 'Confirmed' },
    IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'slate', label: 'Cancelled' },
    NO_SHOW: { variant: 'danger', label: 'No Show' },
    
    // Beds
    AVAILABLE: { variant: 'success', label: 'Available' },
    OCCUPIED: { variant: 'danger', label: 'Occupied' },
    RESERVED: { variant: 'warning', label: 'Reserved' },
    MAINTENANCE: { variant: 'slate', label: 'Maintenance' },
    
    // IPD
    ADMITTED: { variant: 'info', label: 'Admitted' },
    STABLE: { variant: 'success', label: 'Stable' },
    CRITICAL: { variant: 'danger', label: 'Critical' },
    DISCHARGED: { variant: 'slate', label: 'Discharged' },
    
    // Prescriptions/Lab
    PENDING: { variant: 'warning', label: 'Pending' },
    DISPENSED: { variant: 'success', label: 'Dispensed' },
    COLLECTED: { variant: 'info', label: 'Collected' },
    REPORTED: { variant: 'success', label: 'Reported' },
    
    // Invoices
    PAID: { variant: 'success', label: 'Paid' },
    UNPAID: { variant: 'danger', label: 'Unpaid' },
    PARTIAL: { variant: 'warning', label: 'Partial' },
    
    // Active/Inactive
    ACTIVE: { variant: 'success', label: 'Active' },
    INACTIVE: { variant: 'slate', label: 'Inactive' },
  };

  const config = statusMap[status?.toUpperCase()] || { variant: 'slate', label: status || 'Unknown' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
