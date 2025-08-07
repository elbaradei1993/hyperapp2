import { useState, useEffect, useCallback, useRef } from 'react';
import { VibeService, VibeReport } from '@/services/vibes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseVibeDataOptions {
  limit?: number;
  enableRealtime?: boolean;
}

export const useVibeData = (options: UseVibeDataOptions = {}) => {
  const { limit = 50, enableRealtime = true } = options;
  const [vibes, setVibes] = useState<VibeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const loadVibes = useCallback(async () => {
    try {
      setError(null);
      const data = await VibeService.getVibeReports(0, limit);
      
      // Filter out invalid coordinates to improve map performance
      const validVibes = data.filter(vibe => {
        const lat = parseFloat(vibe.latitude);
        const lng = parseFloat(vibe.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      });
      
      setVibes(validVibes);
    } catch (error) {
      console.error("Error loading vibes:", error);
      setError("Failed to load vibe data");
      toast({
        title: "Failed to load vibes",
        description: "Could not load vibe data from the server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [limit, toast]);

  useEffect(() => {
    loadVibes();

    if (enableRealtime) {
      // Set up real-time subscription with debouncing
      channelRef.current = supabase
        .channel('vibe_reports_optimized')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'vibe_reports' 
        }, (payload) => {
          // Add new vibe if it has valid coordinates
          const newVibe = payload.new as any;
          const lat = parseFloat(newVibe.latitude);
          const lng = parseFloat(newVibe.longitude);
          
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            setVibes(prev => [newVibe, ...prev.slice(0, limit - 1)]);
          }
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'vibe_reports' 
        }, (payload) => {
          // Update existing vibe
          const updatedVibe = payload.new as any;
          setVibes(prev => prev.map(vibe => 
            vibe.id === updatedVibe.id ? updatedVibe : vibe
          ));
        })
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadVibes, enableRealtime, limit]);

  const refetch = useCallback(() => {
    setLoading(true);
    loadVibes();
  }, [loadVibes]);

  return {
    vibes,
    loading,
    error,
    refetch
  };
};