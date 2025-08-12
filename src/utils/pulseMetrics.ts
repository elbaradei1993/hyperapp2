import { VibeReport } from "@/services/vibes";

export type PulseMetrics = {
  totalReports: number;
  activeUsers: number;
  safetyScore: number; // 0-10
  moodDistribution: { great: number; good: number; okay: number; poor: number };
};

const typeWeights: Record<string, number> = {
  dangerous: 1.4,
  suspicious: 1.1,
  crowded: 0.9,
  party: 0.8,
  event: 0.7,
  friendly: 0.6,
  social: 0.6,
  calm: 0.3,
  peaceful: 0.2,
  safe: 0.2,
};

function decay(created_at?: string | null) {
  if (!created_at) return 0.6; // conservative
  const mins = Math.max(0, (Date.now() - new Date(created_at).getTime()) / 60000);
  // 4h half-life
  return Math.exp(-mins / 240);
}

export function computeCommunityMetrics(vibes: VibeReport[], sosAlerts: Array<{ created_at?: string | null }>): PulseMetrics {
  const totalReports = (vibes?.length || 0) + (sosAlerts?.length || 0);

  // Safety score calculation
  let risk = 0;
  for (const v of vibes) {
    const name = v.vibe_type?.name?.toLowerCase() || '';
    const w = Object.entries(typeWeights).find(([k]) => name.includes(k))?.[1] || 0.5;
    const confirmFactor = Math.min((v.confirmed_count || 0) / 5, 2);
    risk += w * (1 + confirmFactor) * decay(v.created_at);
  }
  // SOS alerts carry strong weight
  for (const s of sosAlerts || []) risk += 1.2 * decay(s.created_at);

  // Normalize to 0-10 scale (rounded to integer for clarity)
  const norm = totalReports > 0 ? risk / Math.max(totalReports * 0.6, 1) : 0;
  const safetyScore = Math.round(Math.max(0, Math.min(10, 10 - norm * 5)));


  // Active users (heuristic): reports * participation factor
  const activeUsers = Math.round(totalReports * 1.8);

  // Mood distribution by mapping types
  const counts = { great: 0, good: 0, okay: 0, poor: 0 };
  for (const v of vibes) {
    const name = v.vibe_type?.name?.toLowerCase() || '';
    const add = 1 * decay(v.created_at);
    if (name.includes('calm') || name.includes('peace')) counts.great += add;
    else if (name.includes('event') || name.includes('friendly') || name.includes('social')) counts.good += add;
    else if (name.includes('crowded') || name.includes('noisy')) counts.okay += add;
    else if (name.includes('danger') || name.includes('suspicious')) counts.poor += add;
    else counts.good += add;
  }
  const sum = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const moodDistribution = {
    great: Math.round((counts.great / sum) * 100),
    good: Math.round((counts.good / sum) * 100),
    okay: Math.round((counts.okay / sum) * 100),
    poor: Math.round((counts.poor / sum) * 100),
  };

  return { totalReports, activeUsers, safetyScore, moodDistribution };
}
