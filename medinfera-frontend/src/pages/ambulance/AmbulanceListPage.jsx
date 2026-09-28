import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, MapPin, User, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { ambulanceService } from '../../services/ambulanceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const AmbulanceListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState('BASIC');
  const canDispatch = ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'].includes(user?.role);
  const canManageFleet = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

  const { data: ambulances = [], isLoading, isError } = useQuery({
    queryKey: ['ambulances'],
    queryFn: async () => {
      const res = await ambulanceService.getAll();
      return res.data.data;
    }
  });

  const { data: pendingDispatches } = useQuery({
    queryKey: ['dispatches', 'requested-count'],
    queryFn: async () => ambulanceService.getDispatches({ status: 'REQUESTED', page: 1, limit: 1 }),
  });

  const createMutation = useMutation({
    mutationFn: () => ambulanceService.create({ vehicleNumber, type }),
    onSuccess: () => {
      toast.success('Ambulance added to the fleet');
      setCreateOpen(false);
      setVehicleNumber('');
      setType('BASIC');
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not add ambulance'),
  });

  const columns = [
    { header: 'Vehicle #', accessorKey: 'vehicleNumber', cell: ({ row }) => (
      <div className="font-bold text-slate-900">{row.original.vehicleNumber}</div>
    )},
    { header: 'Type', accessorKey: 'type', cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">{row.original.type}</span>
    )},
    { header: 'Driver', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
          <User className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.original.driverId ? `Driver ${row.original.driverId.slice(-6)}` : 'Unassigned'}</p>
        </div>
      </div>
    )},
    { header: 'Current Location', accessorKey: 'currentLocation', cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm text-slate-600">
        <MapPin className="w-3.5 h-3.5 text-slate-400" />
        {row.original.gpsLatitude && row.original.gpsLongitude ? `${row.original.gpsLatitude}, ${row.original.gpsLongitude}` : 'No GPS fix'}
      </div>
    )},
    { header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-2">
        {canDispatch && (
        <Button variant="ghost" size="sm" icon={Navigation} onClick={() => navigate(`/ambulance/dispatch`, { state: { ambulanceId: row.original.id } })}>
          Dispatch
        </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ambulance Fleet" 
        description="Monitor and dispatch emergency response vehicles."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/ambulance/tracking')}>View Dispatches</Button>
            {canManageFleet && <Button icon={Plus} onClick={() => setCreateOpen(true)}>Add Vehicle</Button>}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Available</p>
            <p className="text-lg font-bold text-slate-900">{ambulances.filter(vehicle => vehicle.status === 'AVAILABLE').length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Navigation className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">On Duty</p>
            <p className="text-lg font-bold text-slate-900">{ambulances.filter(vehicle => !['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].includes(vehicle.status)).length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-medium">Pending Requests</p>
            <p className="text-lg font-bold text-slate-900">{pendingDispatches?.data?.pagination?.total || 0}</p>
          </div>
        </Card>
      </div>

      <Card>
        {isError ? <p className="p-6 text-sm text-red-600">The ambulance fleet could not be loaded.</p> : <DataTable
          columns={columns}
          data={ambulances}
          isLoading={isLoading}
          emptyStateTitle="No ambulances found"
          emptyStateDescription="Manage your hospital's emergency fleet here."
        />}
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Add ambulance">
        <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="space-y-4">
          <Input label="Vehicle number" value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value.toUpperCase())} required />
          <Select label="Ambulance type" value={type} onChange={(event) => setType(event.target.value)}>
            {['BASIC', 'ADVANCED_LIFE_SUPPORT', 'ICU_MOBILE', 'MORTUARY', 'NEONATAL'].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
          </Select>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" isLoading={createMutation.isPending} disabled={!vehicleNumber.trim()}>Add vehicle</Button></div>
        </form>
      </Modal>
    </div>
  );
};
