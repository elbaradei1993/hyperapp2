import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ExternalVibeAPI, VibeDataPoint } from '@/services/externalVibeAPI';
import { useToast } from '@/hooks/use-toast';

interface VibeDataContextType {
  vibes: VibeDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateInterval: number;
  setUpdateInterval: (interval: number) => void;
}

const VibeDataContext = createContext<VibeDataContextType | undefined>(undefined);

interface VibeDataProviderProps {
  children: ReactNode;
  enableRealtime?: boolean;
  defaultUpdateInterval?: number;
}

export const VibeDataProvider: React.FC<VibeDataProviderProps> = ({
  children,
  enableRealtime = true,
  defaultUpdateInterval = 30000 // 30 seconds
}) => {
  const [vibes, setVibes] = useState<VibeDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateInterval, setUpdateInterval] = useState(defaultUpdateInterval);
  const { toast } = useToast();

  const fetchVibeData = useCallback(async () => {
    try {
      setError(null);
      const data = await ExternalVibeAPI.fetchVibeData();
      setVibes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vibe data';
      setError(errorMessage);
      console.error('Error fetching vibe data:', err);
      
      if (!loading) { // Only show toast if not initial load
        toast({
          title: "Failed to update vibe data",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [loading, toast]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchVibeData();
  }, [fetchVibeData]);

  // Initial fetch
  useEffect(() => {
    fetchVibeData();
  }, [fetchVibeData]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime || updateInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchVibeData();
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [enableRealtime, updateInterval, fetchVibeData]);

  const value = {
    vibes,
    loading,
    error,
    refetch,
    updateInterval,
    setUpdateInterval
  };

  return (
    <VibeDataContext.Provider value={value}>
      {children}
    </VibeDataContext.Provider>
  );
};

export const useVibeDataContext = () => {
  const context = useContext(VibeDataContext);
  if (context === undefined) {
    throw new Error('useVibeDataContext must be used within a VibeDataProvider');
  }
  return context;
};