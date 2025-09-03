import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  CheckCircle,
  Circle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalVibes: number;
  weeklyProgress: number;
  recentDays: boolean[];
}

const VibeStreakTracker = () => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalVibes: 0,
    weeklyProgress: 0,
    recentDays: Array(7).fill(false)
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get the user mapping to integer ID
      const { data: userMapping } = await supabase
        .from('user_mapping')
        .select('integer_id')
        .eq('uuid_id', user.id)
        .maybeSingle();

      if (!userMapping) {
        setLoading(false);
        return;
      }

      const { data: vibes } = await supabase
        .from('vibe_reports')
        .select('created_at')
        .eq('user_id', userMapping.integer_id)
        .order('created_at', { ascending: false });

      if (!vibes || vibes.length === 0) {
        setLoading(false);
        return;
      }

      const weeklyVibes = vibes.filter(v => 
        new Date(v.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      const recentDays = Array(7).fill(false).map((_, i) => {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - (6 - i));
        return vibes.some(v => 
          new Date(v.created_at).toDateString() === checkDate.toDateString()
        );
      });

      setStreakData({
        currentStreak: Math.min(vibes.length, 7),
        longestStreak: Math.min(vibes.length, 30),
        totalVibes: vibes.length,
        weeklyProgress: weeklyVibes.length,
        recentDays
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Vibe Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Vibe Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold flex items-center justify-center gap-2">
            <Flame className={`h-8 w-8 ${streakData.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            {streakData.currentStreak}
          </div>
          <Badge className="bg-orange-500 text-white mt-2">
            Active
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{streakData.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{streakData.totalVibes}</div>
            <div className="text-xs text-muted-foreground">Total Vibes</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{streakData.weeklyProgress}/5</div>
            <div className="text-xs text-muted-foreground">Weekly Goal</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Last 7 Days</div>
          <div className="flex gap-1 justify-between">
            {streakData.recentDays.map((hasVibe, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasVibe ? 'bg-green-500' : 'bg-muted'
                }`}>
                  {hasVibe ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VibeStreakTracker;