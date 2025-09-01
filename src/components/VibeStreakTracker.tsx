import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Calendar, 
  Target,
  Trophy,
  Zap,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalVibes: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastVibeDate: string | null;
  achievements: string[];
}

export const VibeStreakTracker: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalVibes: 0,
    weeklyGoal: 7,
    weeklyProgress: 0,
    lastVibeDate: null,
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStreakData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user's integer ID for vibe reports
        const { data: userMapping } = await supabase
          .from('user_mapping')
          .select('integer_id')
          .eq('uuid_id', user.id)
          .single();

        if (!userMapping?.integer_id) {
          setLoading(false);
          return;
        }

        // Get user's vibe reports
        const { data: vibes } = await supabase
          .from('vibe_reports')
          .select('created_at')
          .eq('user_id', userMapping.integer_id)
          .order('created_at', { ascending: false });

        if (!vibes || vibes.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate streaks
        const vibeDates = vibes.map(v => new Date(v.created_at).toDateString());
        const uniqueDates = [...new Set(vibeDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        // Calculate current streak
        if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
          let checkDate = new Date();
          let streakBroken = false;
          
          while (!streakBroken && currentStreak < uniqueDates.length) {
            const checkDateStr = checkDate.toDateString();
            if (uniqueDates.includes(checkDateStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else if (checkDateStr === today && uniqueDates.includes(yesterday)) {
              // Skip today if no vibe but had one yesterday
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              streakBroken = true;
            }
          }
        }

        // Calculate longest streak
        for (let i = 0; i < uniqueDates.length; i++) {
          tempStreak = 1;
          const startDate = new Date(uniqueDates[i]);
          
          for (let j = i + 1; j < uniqueDates.length; j++) {
            const currentDate = new Date(uniqueDates[j]);
            const expectedDate = new Date(startDate);
            expectedDate.setDate(expectedDate.getDate() - tempStreak);
            
            if (currentDate.toDateString() === expectedDate.toDateString()) {
              tempStreak++;
            } else {
              break;
            }
          }
          
          longestStreak = Math.max(longestStreak, tempStreak);
        }

        // Calculate weekly progress
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weeklyVibes = vibes.filter(v => new Date(v.created_at) >= weekStart);
        const weeklyProgress = Math.min(weeklyVibes.length, 7);

        // Determine achievements
        const achievements = [];
        if (currentStreak >= 3) achievements.push('3-Day Streak');
        if (currentStreak >= 7) achievements.push('Week Warrior');
        if (currentStreak >= 30) achievements.push('Monthly Master');
        if (longestStreak >= 50) achievements.push('Streak Legend');
        if (vibes.length >= 100) achievements.push('Century Club');
        if (weeklyProgress >= 7) achievements.push('Weekly Champion');

        setStreakData({
          currentStreak,
          longestStreak,
          totalVibes: vibes.length,
          weeklyGoal: 7,
          weeklyProgress,
          lastVibeDate: vibes[0]?.created_at || null,
          achievements
        });

      } catch (error) {
        console.error('Error fetching streak data:', error);
        toast({
          title: 'Error loading streak data',
          description: 'Could not load your vibe streak information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [user, toast]);

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
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const streakEmoji = streakData.currentStreak >= 7 ? '🔥' : streakData.currentStreak >= 3 ? '⭐' : '💫';
  const progressPercentage = (streakData.weeklyProgress / streakData.weeklyGoal) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Vibe Streak {streakEmoji}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500 mb-1">
            {streakData.currentStreak}
          </div>
          <p className="text-sm text-muted-foreground">Day streak</p>
          {streakData.currentStreak > 0 && (
            <Badge variant="outline" className="mt-1">
              Keep it up!
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-500">
              {streakData.longestStreak}
            </div>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-500">
              {streakData.totalVibes}
            </div>
            <p className="text-xs text-muted-foreground">Total Vibes</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Weekly Goal</span>
            <span className="text-sm text-muted-foreground">
              {streakData.weeklyProgress}/{streakData.weeklyGoal}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          {streakData.weeklyProgress >= streakData.weeklyGoal && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Weekly goal achieved!</span>
            </div>
          )}
        </div>

        {/* Achievements */}
        {streakData.achievements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Achievements</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {streakData.achievements.map((achievement, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last Vibe */}
        {streakData.lastVibeDate && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last vibe: {new Date(streakData.lastVibeDate).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VibeStreakTracker;