import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, MapPin, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { useVibeDataContext } from '@/contexts/VibeDataContext';

export const VibeDataStats: React.FC = () => {
  const { vibes, loading, error, refetch, updateInterval, setUpdateInterval } = useVibeDataContext();

  const stats = React.useMemo(() => {
    if (!vibes.length) return { total: 0, avgIntensity: 0, highIntensity: 0, recentCount: 0 };

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    const recentVibes = vibes.filter(vibe => 
      vibe.timestamp && new Date(vibe.timestamp) > thirtyMinutesAgo
    );

    const highIntensityVibes = vibes.filter(vibe => vibe.intensity > 0.7);
    const avgIntensity = vibes.reduce((sum, vibe) => sum + vibe.intensity, 0) / vibes.length;

    return {
      total: vibes.length,
      avgIntensity: parseFloat(avgIntensity.toFixed(3)),
      highIntensity: highIntensityVibes.length,
      recentCount: recentVibes.length
    };
  }, [vibes]);

  const handleRefresh = async () => {
    await refetch();
  };

  const updateIntervals = [
    { value: 10000, label: '10s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '1m' },
    { value: 300000, label: '5m' }
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="feature-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {stats.total}
            </div>
            <div className="text-xs text-muted-foreground">Vibe Locations</div>
          </CardContent>
        </Card>

        <Card className="feature-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500 mb-1">
              {stats.avgIntensity}
            </div>
            <div className="text-xs text-muted-foreground">Activity Level</div>
          </CardContent>
        </Card>

        <Card className="feature-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-500 mb-1">
              {stats.highIntensity}
            </div>
            <div className="text-xs text-muted-foreground">Hot Spots</div>
          </CardContent>
        </Card>

        <Card className="feature-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500 mb-1">
              {stats.recentCount}
            </div>
            <div className="text-xs text-muted-foreground">Live Activity</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="feature-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Live Data Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Data Status</div>
              <div className="flex items-center space-x-2">
                {loading && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Updating...</span>
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive">
                    Error: {error}
                  </Badge>
                )}
                {!loading && !error && (
                  <Badge variant="default" className="bg-green-500">
                    Live
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Update Interval */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Update Interval</div>
            <div className="flex flex-wrap gap-2">
              {updateIntervals.map((interval) => (
                <Button
                  key={interval.value}
                  size="sm"
                  variant={updateInterval === interval.value ? 'default' : 'outline'}
                  onClick={() => setUpdateInterval(interval.value)}
                >
                  {interval.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Last Update */}
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};