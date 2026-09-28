import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => {
    return hasRole('ADMIN', 'SUPER_ADMIN');
  };

  // Simplified module access check based on role
  const canAccess = (module) => {
    if (isAdmin()) return true;

    const roleAccess = {
      DOCTOR: ['dashboard', 'patients', 'appointments', 'ipd', 'prescriptions', 'lab'],
      RECEPTIONIST: ['dashboard', 'patients', 'appointments', 'ipd', 'invoices', 'ambulance'],
      NURSE: ['dashboard', 'patients', 'ipd', 'beds'],
      PHARMACIST: ['dashboard', 'medicines', 'prescriptions', 'suppliers', 'purchase-orders'],
      LAB_TECHNICIAN: ['dashboard', 'lab/orders', 'lab/tests', 'lab/results'],
      BILLING: ['dashboard', 'invoices', 'payments'],
      DRIVER: ['dashboard', 'ambulance']
    };

    const allowedModules = roleAccess[user?.role] || [];
    return allowedModules.includes(module);
  };

  return { hasRole, isAdmin, canAccess };
};
