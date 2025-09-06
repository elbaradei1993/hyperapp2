import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Activity, MapPin, RefreshCw, Clock, TrendingUp, Eye } from 'lucide-react';
import { useVibeDataContext } from '@/contexts/VibeDataContext';
import { VibeDataPoint } from '@/services/externalVibeAPI';

interface VibeDataStatsProps {
  onLocationClick?: (location: { lat: number; lng: number }) => void;
}

export const VibeDataStats: React.FC<VibeDataStatsProps> = ({ onLocationClick }) => {
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

  const handleLocationClick = (vibe: VibeDataPoint) => {
    if (onLocationClick) {
      onLocationClick({ lat: vibe.lat, lng: vibe.lng });
    }
  };

  const getVibesByCategory = () => {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    return {
      all: vibes,
      highIntensity: vibes.filter(vibe => vibe.intensity > 0.7),
      recent: vibes.filter(vibe => 
        vibe.timestamp && new Date(vibe.timestamp) > thirtyMinutesAgo
      )
    };
  };

  const vibeCategories = getVibesByCategory();

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color, 
    vibeList 
  }: { 
    icon: any; 
    title: string; 
    value: number | string; 
    color: string;
    vibeList?: VibeDataPoint[];
  }) => (
    <Card className="feature-card">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className={`text-2xl font-bold ${color} mb-1`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground mb-2">{title}</div>
        {vibeList && vibeList.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span>{title} - {vibeList.length} Locations</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {vibeList.map((vibe, index) => (
                  <Card key={vibe.id || index} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleLocationClick(vibe)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {vibe.lat.toFixed(4)}, {vibe.lng.toFixed(4)}
                          </span>
                          <Badge variant={vibe.intensity > 0.7 ? 'destructive' : vibe.intensity > 0.4 ? 'default' : 'secondary'}>
                            {(vibe.intensity * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {vibe.type || 'Activity'} • 
                          Intensity: {vibe.intensity.toFixed(3)} •
                          {vibe.timestamp && ` Time: ${new Date(vibe.timestamp).toLocaleTimeString()}`}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs">
                        View on Map →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          title="Vibe Locations"
          value={stats.total}
          color="text-primary"
          vibeList={vibeCategories.all}
        />
        
        <StatCard
          icon={Activity}
          title="Activity Level"
          value={stats.avgIntensity}
          color="text-green-500"
          vibeList={vibeCategories.all}
        />
        
        <StatCard
          icon={TrendingUp}
          title="Hot Spots"
          value={stats.highIntensity}
          color="text-red-500"
          vibeList={vibeCategories.highIntensity}
        />
        
        <StatCard
          icon={Clock}
          title="Live Activity"
          value={stats.recentCount}
          color="text-blue-500"
          vibeList={vibeCategories.recent}
        />
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