
// Types for the Vibe services
export interface Vibe {
  id: number;
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  created_at: string;
  confirmed_count: number;
  vibe_type: {
    name: string;
    color: string;
  };
  vibe_type_id: number;
}

export interface VibeType {
  id: number;
  name: string;
  color: string;
}

export interface VibeReport {
  id: number;
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  created_at: string;
  confirmed_count: number;
  vibe_type_id: number;
  vibe_type?: {
    name: string;
    color: string;
  };
  user_id?: number;
}

export interface CreateVibeReportInput {
  title: string;
  description: string;
  latitude: string;
  longitude: string;
  vibe_type_id: number;
  user_id?: number | null;
}

// Define the type for the increment vibe count params to match the RPC expectation
export interface IncrementVibeCountParams {
  vibe_id: number;
}
