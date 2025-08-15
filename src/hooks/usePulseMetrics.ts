import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VibeReportsService } from '@/services/vibes/vibeReportsService';
import { computeCommunityMetrics, PulseMetrics } from '@/utils/pulseMetrics';
import { useAccurateLocation } from '@/hooks/useAccurateLocation';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface UsePulseMetricsOptions {
  radiusKm?: number; // Area radius for mood distribution & stats
}

export function usePulseMetrics({ radiusKm = 10 }: UsePulseMetricsOptions = {}) {
  const [metrics, setMetrics] = useState<PulseMetrics>({
    totalReports: 0,
    activeUsers: 0,
    safetyScore: 10,
    moodDistribution: { great: 0, good: 0, okay: 0, poor: 0 },
  });
  const [loading, setLoading] = useState(true);
  const { position } = useAccurateLocation({ maximumAge: 300000 });

  const areaLabel = useMemo(() => {
    if (!position) return 'global';
    return `${radiusKm} km radius`;
  }, [position, radiusKm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      const [vibes, sos] = await Promise.all([
        VibeReportsService.getVibeReports(0, 1000),
        user
          ? supabase.from('sos_alerts').select('created_at, latitude, longitude').order('created_at', { ascending: false }).limit(1000)
          : Promise.resolve({ data: [] })
      ]);

      const center = position;
      const filteredVibes = center
        ? (vibes || []).filter((v: any) => {
            const lat = parseFloat(v.latitude);
            const lng = parseFloat(v.longitude);
            if (isNaN(lat) || isNaN(lng)) return false;
            return haversineKm(center[0], center[1], lat, lng) <= radiusKm;
          })
        : (vibes || []);

      const sosAlerts = (sos.data || []) as Array<{ created_at?: string | null; latitude?: string; longitude?: string }>;
      const filteredSos = center
        ? sosAlerts.filter((s) => {
            const lat = parseFloat(s.latitude || '');
            const lng = parseFloat(s.longitude || '');
            if (isNaN(lat) || isNaN(lng)) return false;
            return haversineKm(center[0], center[1], lat, lng) <= radiusKm;
          })
        : sosAlerts;

      const m = computeCommunityMetrics(filteredVibes as any, filteredSos as any);
      setMetrics(m);
    } catch (e) {
      console.error('Failed to load pulse metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Realtime updates only for authenticated users
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;

      const channel = supabase
        .channel('pulse-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vibe_reports' }, fetchData)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vibe_reports' }, fetchData)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sos_alerts' }, fetchData)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sos_alerts' }, fetchData)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.[0], position?.[1], radiusKm]);

  return { metrics, loading, areaLabel };
}
