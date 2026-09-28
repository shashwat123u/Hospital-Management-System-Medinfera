import React, { useEffect } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, Navigation, Truck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ambulanceService } from '../../services/ambulanceService';
import { useSocket } from '../../hooks/useSocket';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export const TrackingPage = () => {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const { data: dispatchData, isLoading, isError } = useQuery({
    queryKey: ['dispatches', 'active'],
    queryFn: async () => {
      const response = await ambulanceService.getDispatches({ active: 'true', page: 1, limit: 100 });
      return response.data;
    },
    refetchInterval: 30000,
  });
  const dispatches = dispatchData?.data || [];

  const ambulanceQueries = useQueries({
    queries: dispatches.map((dispatch) => ({
      queryKey: ['ambulances', dispatch.ambulanceId],
      queryFn: async () => {
        const response = await ambulanceService.getById(dispatch.ambulanceId);
        return response.data.data;
      },
      refetchInterval: 30000,
    })),
  });

  useEffect(() => {
    if (!socket) return undefined;

    const onLocation = (location) => {
      queryClient.setQueryData(['ambulances', location.ambulanceId], (ambulance) => ambulance && ({
        ...ambulance,
        gpsLatitude: location.latitude,
        gpsLongitude: location.longitude,
        lastLocationUpdate: location.timestamp,
      }));
    };
    const refreshDispatches = () => queryClient.invalidateQueries({ queryKey: ['dispatches', 'active'] });

    socket.on('ambulance:location_update', onLocation);
    socket.on('ambulance:dispatched', refreshDispatches);
    socket.on('ambulance:status_update', refreshDispatches);
    return () => {
      socket.off('ambulance:location_update', onLocation);
      socket.off('ambulance:dispatched', refreshDispatches);
      socket.off('ambulance:status_update', refreshDispatches);
    };
  }, [socket, queryClient]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ambulance Tracking" 
        description="Active dispatches and the latest reported ambulance positions."
        actions={<Badge variant={isConnected ? 'success' : 'warning'}>{isConnected ? 'Live connection' : 'Reconnecting'}</Badge>}
      />

      {isError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Active dispatches could not be loaded.</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[1, 2].map(item => <Skeleton key={item} className="h-48" />)}</div>
      ) : dispatches.length === 0 ? (
        <EmptyState title="No active dispatches" description="Ambulance locations will appear when a dispatch is active." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dispatches.map((dispatch, index) => {
            const ambulance = ambulanceQueries[index]?.data || dispatch.ambulance;
            const latitude = Number(ambulance?.gpsLatitude);
            const longitude = Number(ambulance?.gpsLongitude);
            const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
            const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
            return (
              <Card key={dispatch.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700"><Truck className="h-5 w-5" /></div>
                      <div>
                        <h2 className="font-semibold text-slate-900">{ambulance?.vehicleNumber || 'Ambulance'}</h2>
                        <p className="text-sm text-slate-500">{ambulance?.type?.replaceAll('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge variant="info">{dispatch.status?.replaceAll('_', ' ')}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs uppercase text-slate-400">Pickup</p><p className="mt-1 text-slate-700">{dispatch.pickupAddress}</p></div>
                    <div><p className="text-xs uppercase text-slate-400">Destination</p><p className="mt-1 text-slate-700">{dispatch.destination || 'Not specified'}</p></div>
                    <div><p className="text-xs uppercase text-slate-400">Patient</p><p className="mt-1 text-slate-700">{dispatch.patient ? `${dispatch.patient.firstName} ${dispatch.patient.lastName}` : 'Not assigned'}</p></div>
                    <div><p className="text-xs uppercase text-slate-400">Requested</p><p className="mt-1 flex items-center gap-1 text-slate-700"><Clock className="h-3.5 w-3.5" />{dispatch.requestedAt ? `${formatDistanceToNow(new Date(dispatch.requestedAt))} ago` : '—'}</p></div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    {hasCoordinates ? (
                      <a className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800" href={mapUrl} target="_blank" rel="noreferrer"><MapPin className="h-4 w-4" />{latitude.toFixed(5)}, {longitude.toFixed(5)}</a>
                    ) : <span className="text-sm text-slate-500">No GPS position reported</span>}
                    {hasCoordinates && <a aria-label="Open ambulance position in OpenStreetMap" title="Open map" href={mapUrl} target="_blank" rel="noreferrer"><Navigation className="h-4 w-4 text-slate-500" /></a>}
                  </div>
                  {ambulance?.lastLocationUpdate && <p className="text-xs text-slate-400">Updated {formatDistanceToNow(new Date(ambulance.lastLocationUpdate))} ago</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
