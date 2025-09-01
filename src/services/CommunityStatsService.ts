import { supabase } from "@/integrations/supabase/client";

export interface CommunityStats {
  totalMembers: number;
  totalCommunities: number;
  publicCommunities: number;
  privateCommunities: number;
  myCommunitiesCount: number;
  totalVibeReports: number;
  totalSosAlerts: number;
  activeUsersToday: number;
  averageVibesPerCommunity: number;
  mostActiveCommnuity: {
    name: string;
    memberCount: number;
  } | null;
}

export interface UserStats {
  vibeReportsCount: number;
  communitiesJoined: number;
  communitiesOwned: number;
  savedVibesCount: number;
  points: number;
  reputationScore: number;
  joinedDate: string;
  lastActiveDate: string;
}

export interface CreativeInsights {
  moodTrend: 'improving' | 'stable' | 'declining';
  safestHour: number;
  mostActiveDay: string;
  communityGrowthRate: number;
  yourRank: number;
  nearbyActivity: number;
}

export class CommunityStatsService {
  static async getCommunityStats(): Promise<CommunityStats> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      // Get total communities
      const { count: totalCommunities } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true });

      // Get public vs private communities
      const { count: publicCommunities } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      // Get user's communities count
      let myCommunitiesCount = 0;
      if (user) {
        const { count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        myCommunitiesCount = count || 0;
      }

      // Get total members across all communities
      const { count: totalMembers } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true });

      // Get vibe reports count
      const { count: totalVibeReports } = await supabase
        .from('vibe_reports')
        .select('*', { count: 'exact', head: true });

      // Get SOS alerts count (only if authenticated)
      let totalSosAlerts = 0;
      if (user) {
        const { count } = await supabase
          .from('sos_alerts')
          .select('*', { count: 'exact', head: true });
        totalSosAlerts = count || 0;
      }

      // Get active users today (users who created reports today)
      const today = new Date().toISOString().split('T')[0];
      const { data: activeUsers } = await supabase
        .from('vibe_reports')
        .select('user_id')
        .gte('created_at', today);
      
      const activeUsersToday = new Set(activeUsers?.map(u => u.user_id).filter(Boolean)).size;

      // Get most active community
      const { data: communityStats } = await supabase
        .from('community_members')
        .select(`
          community_id,
          communities!inner(name)
        `);

      let mostActiveCommnuity = null;
      if (communityStats?.length) {
        const communityMemberCounts = communityStats.reduce((acc: any, member: any) => {
          const communityName = member.communities?.name;
          if (communityName) {
            acc[communityName] = (acc[communityName] || 0) + 1;
          }
          return acc;
        }, {});

        const [name, memberCount] = Object.entries(communityMemberCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))[0] || [];
        
        if (name) {
          mostActiveCommnuity = { name: name as string, memberCount: memberCount as number };
        }
      }

      const averageVibesPerCommunity = totalCommunities ? Math.round((totalVibeReports || 0) / totalCommunities) : 0;

      return {
        totalMembers: totalMembers || 0,
        totalCommunities: totalCommunities || 0,
        publicCommunities: publicCommunities || 0,
        privateCommunities: (totalCommunities || 0) - (publicCommunities || 0),
        myCommunitiesCount,
        totalVibeReports: totalVibeReports || 0,
        totalSosAlerts,
        activeUsersToday,
        averageVibesPerCommunity,
        mostActiveCommnuity
      };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      throw error;
    }
  }

  static async getUserStats(): Promise<UserStats> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, reputation')
        .eq('id', user.id)
        .single();

      // Get user's vibe reports count
      const { data: userMapping } = await supabase
        .from('user_mapping')
        .select('integer_id')
        .eq('uuid_id', user.id)
        .single();

      let vibeReportsCount = 0;
      if (userMapping?.integer_id) {
        const { count } = await supabase
          .from('vibe_reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userMapping.integer_id);
        vibeReportsCount = count || 0;
      }

      // Get communities joined
      const { count: communitiesJoined } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get communities owned
      const { count: communitiesOwned } = await supabase
        .from('communities')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // Get saved vibes count (assuming there's a saved_vibes table)
      // For now, we'll set it to 0 as we don't have this table
      const savedVibesCount = 0;

      return {
        vibeReportsCount,
        communitiesJoined: communitiesJoined || 0,
        communitiesOwned: communitiesOwned || 0,
        savedVibesCount,
        points: profile?.points || 0,
        reputationScore: profile?.reputation || 0,
        joinedDate: user.created_at || new Date().toISOString(),
        lastActiveDate: new Date().toISOString() // We could track this better
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  static async getCreativeInsights(): Promise<CreativeInsights> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      // Get recent vibe reports to analyze trends
      const { data: recentVibes } = await supabase
        .from('vibe_reports')
        .select('created_at, vibe_type_id, confirmed_count')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Calculate mood trend (simplified)
      let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentVibes && recentVibes.length >= 2) {
        const recent = recentVibes.slice(0, Math.floor(recentVibes.length / 2));
        const older = recentVibes.slice(Math.floor(recentVibes.length / 2));
        
        const recentAvgConfirmed = recent.reduce((sum, v) => sum + v.confirmed_count, 0) / recent.length;
        const olderAvgConfirmed = older.reduce((sum, v) => sum + v.confirmed_count, 0) / older.length;
        
        if (recentAvgConfirmed > olderAvgConfirmed * 1.1) {
          moodTrend = 'improving';
        } else if (recentAvgConfirmed < olderAvgConfirmed * 0.9) {
          moodTrend = 'declining';
        }
      }

      // Find safest hour (hour with least SOS alerts)
      let safestHour = 14; // Default to 2 PM
      if (user) {
        const { data: sosAlerts } = await supabase
          .from('sos_alerts')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (sosAlerts?.length) {
          const hourCounts = new Array(24).fill(0);
          sosAlerts.forEach(alert => {
            if (alert.created_at) {
              const hour = new Date(alert.created_at).getHours();
              hourCounts[hour]++;
            }
          });
          safestHour = hourCounts.indexOf(Math.min(...hourCounts));
        }
      }

      // Find most active day
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let mostActiveDay = 'Monday';
      if (recentVibes?.length) {
        const dayFrquency = new Array(7).fill(0);
        recentVibes.forEach(vibe => {
          const day = new Date(vibe.created_at).getDay();
          dayFrquency[day]++;
        });
        const mostActiveDayIndex = dayFrquency.indexOf(Math.max(...dayFrquency));
        mostActiveDay = dayNames[mostActiveDayIndex];
      }

      // Calculate community growth rate (simplified)
      const { data: recentCommunities } = await supabase
        .from('communities')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: olderCommunities } = await supabase
        .from('communities')
        .select('created_at')
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const communityGrowthRate = olderCommunities?.length 
        ? Math.round(((recentCommunities?.length || 0) / olderCommunities.length) * 100)
        : 100;

      // Calculate user rank (simplified - based on vibe report count)
      let yourRank = 1;
      if (user) {
        const { data: userMapping } = await supabase
          .from('user_mapping')
          .select('integer_id')
          .eq('uuid_id', user.id)
          .single();

        if (userMapping?.integer_id) {
          const { data: userVibeCount } = await supabase
            .from('vibe_reports')
            .select('user_id', { count: 'exact' })
            .eq('user_id', userMapping.integer_id);

          const { data: allUserVibeCounts } = await supabase
            .from('vibe_reports')
            .select('user_id');

          if (allUserVibeCounts?.length) {
            const userCounts = allUserVibeCounts.reduce((acc: any, report) => {
              acc[report.user_id] = (acc[report.user_id] || 0) + 1;
              return acc;
            }, {});

            const myCount = userCounts[userMapping.integer_id] || 0;
            const sortedCounts = Object.values(userCounts).sort((a: any, b: any) => b - a);
            yourRank = sortedCounts.indexOf(myCount) + 1;
          }
        }
      }

      // Nearby activity (simplified)
      const nearbyActivity = Math.floor(Math.random() * 50) + 10; // Random for now

      return {
        moodTrend,
        safestHour,
        mostActiveDay,
        communityGrowthRate,
        yourRank,
        nearbyActivity
      };
    } catch (error) {
      console.error('Error fetching creative insights:', error);
      throw error;
    }
  }
}