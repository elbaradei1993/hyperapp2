
// Re-export all vibe services and types
export * from './types';
export * from './vibeTypesService';
export * from './vibeReportsService';
export * from './trendingVibesService';
export * from './vibeInteractionsService';

// Create a unified VibeService for backward compatibility
import { VibeTypesService } from './vibeTypesService';
import { VibeReportsService } from './vibeReportsService';
import { TrendingVibesService } from './trendingVibesService';
import { VibeInteractionsService } from './vibeInteractionsService';

// Main VibeService object that combines all the individual services
export const VibeService = {
  ...VibeTypesService,
  ...VibeReportsService,
  ...TrendingVibesService,
  ...VibeInteractionsService
};
