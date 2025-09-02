import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  Users, 
  Trophy, 
  Activity,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { CommunityStatsService, CreativeInsights as InsightsType } from '@/services/CommunityStatsService';

const CreativeInsights = () => {
  const [insights, setInsights] = useState<InsightsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await CommunityStatsService.getCreativeInsights();
        setInsights(data);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Creative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Mood Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Trending Moods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.moodTrends.map((mood, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1">
                {mood}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safest Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Safest Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.safestHours.map((hour, index) => (
              <div key={index} className="text-sm font-medium text-green-600 dark:text-green-400">
                {hour}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Active Days */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Active Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.mostActiveDays.map((day, index) => (
              <div key={index} className="text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Growth */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Community Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {insights.communityGrowth > 0 ? '+' : ''}{insights.communityGrowth}%
          </div>
          <p className="text-xs text-muted-foreground">This week vs last week</p>
        </CardContent>
      </Card>

      {/* User Rank */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4" />
            Your Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Top {insights.userRank}%
          </div>
          <p className="text-xs text-muted-foreground">Community contributor</p>
        </CardContent>
      </Card>

      {/* Nearby Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Nearby Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {insights.nearbyActivity}
          </div>
          <p className="text-xs text-muted-foreground">Reports in 24hrs</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreativeInsights;