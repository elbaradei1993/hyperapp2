import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Clock, 
  Calendar,
  Trophy,
  Activity,
  Sparkles,
  Target,
  Users
} from 'lucide-react';
import { CommunityStatsService, CreativeInsights as InsightsType } from '@/services/CommunityStatsService';
import { useToast } from '@/hooks/use-toast';

export const CreativeInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await CommunityStatsService.getCreativeInsights();
        setInsights(data);
      } catch (error) {
        console.error('Error fetching creative insights:', error);
        toast({
          title: 'Error loading insights',
          description: 'Could not load community insights',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Community Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Community Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Trend */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            {getTrendIcon(insights.moodTrend)}
            <span className="text-sm font-medium">Community Mood</span>
          </div>
          <Badge variant="outline" className={getTrendColor(insights.moodTrend)}>
            {insights.moodTrend}
          </Badge>
        </div>

        {/* Safest Hour */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Safest Time</span>
          </div>
          <Badge variant="outline" className="text-green-600 dark:text-green-400">
            {formatHour(insights.safestHour)}
          </Badge>
        </div>

        {/* Most Active Day */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Most Active Day</span>
          </div>
          <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
            {insights.mostActiveDay}
          </Badge>
        </div>

        {/* Community Growth */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Growth Rate</span>
          </div>
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
            {insights.communityGrowthRate}%
          </Badge>
        </div>

        {/* User Rank */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Your Rank</span>
          </div>
          <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
            #{insights.yourRank}
          </Badge>
        </div>

        {/* Nearby Activity */}
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Nearby Activity</span>
          </div>
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
            {insights.nearbyActivity} vibes
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Insights updated based on recent community activity
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreativeInsights;