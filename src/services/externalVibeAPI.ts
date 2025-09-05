// External API service for fetching vibe data in {lat, lng, intensity} format

export interface VibeDataPoint {
  lat: number;
  lng: number;
  intensity: number;
  timestamp?: string;
  id?: string;
  type?: string;
}

export interface ExternalVibeResponse {
  success: boolean;
  data: VibeDataPoint[];
  timestamp: string;
  count: number;
}

class ExternalVibeAPIService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    // Use environment variables for API configuration
    this.baseUrl = import.meta.env.VITE_EXTERNAL_VIBE_API_URL || 'https://api.example.com/vibes';
    this.apiKey = import.meta.env.VITE_EXTERNAL_VIBE_API_KEY;
  }

  async fetchVibeData(): Promise<VibeDataPoint[]> {
    try {
      // If no external API is configured, return mock data for development
      if (!import.meta.env.VITE_EXTERNAL_VIBE_API_URL) {
        return this.generateMockData();
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`External API returned ${response.status}: ${response.statusText}`);
      }

      const data: ExternalVibeResponse = await response.json();

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from external API');
      }

      // Validate and filter the data
      return data.data
        .filter(this.validateVibeDataPoint)
        .map(this.normalizeVibeDataPoint);

    } catch (error) {
      console.error('Error fetching from external vibe API:', error);
      
      // Fallback to mock data if external API fails
      console.warn('Falling back to mock data due to API error');
      return this.generateMockData();
    }
  }

  private validateVibeDataPoint(point: any): point is VibeDataPoint {
    return (
      typeof point === 'object' &&
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      typeof point.intensity === 'number' &&
      point.lat >= -90 && point.lat <= 90 &&
      point.lng >= -180 && point.lng <= 180 &&
      point.intensity >= 0 && point.intensity <= 1
    );
  }

  private normalizeVibeDataPoint(point: VibeDataPoint): VibeDataPoint {
    return {
      lat: Number(point.lat.toFixed(6)),
      lng: Number(point.lng.toFixed(6)),
      intensity: Math.max(0, Math.min(1, point.intensity)), // Ensure 0-1 range
      timestamp: point.timestamp || new Date().toISOString(),
      id: point.id || `${point.lat}_${point.lng}_${Date.now()}`,
      type: point.type || 'general'
    };
  }

  private generateMockData(): VibeDataPoint[] {
    // Generate realistic mock data around Cairo, Egypt for development
    const centerLat = 30.0444;
    const centerLng = 31.2357;
    const mockData: VibeDataPoint[] = [];

    // Generate 50-100 random points around Cairo
    const count = Math.floor(Math.random() * 50) + 50;
    
    for (let i = 0; i < count; i++) {
      // Random offset within ~20km radius
      const offsetLat = (Math.random() - 0.5) * 0.3;
      const offsetLng = (Math.random() - 0.5) * 0.3;
      
      const lat = centerLat + offsetLat;
      const lng = centerLng + offsetLng;
      
      // Generate intensity based on distance from center (more activity in center)
      const distanceFromCenter = Math.sqrt(offsetLat * offsetLat + offsetLng * offsetLng);
      const baseIntensity = Math.max(0.1, 1 - distanceFromCenter * 2);
      const randomVariation = (Math.random() - 0.5) * 0.4;
      const intensity = Math.max(0.1, Math.min(1, baseIntensity + randomVariation));

      const types = ['social', 'traffic', 'event', 'gathering', 'alert'];
      const type = types[Math.floor(Math.random() * types.length)];

      mockData.push({
        lat,
        lng,
        intensity,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
        id: `mock_${i}`,
        type
      });
    }

    // Add some high-intensity hotspots
    const hotspots = [
      { lat: 30.0626, lng: 31.2497, name: 'Tahrir Square' },
      { lat: 30.0131, lng: 31.2089, name: 'Giza Pyramids' },
      { lat: 30.0875, lng: 31.3247, name: 'Nasr City' },
      { lat: 29.9792, lng: 31.1342, name: 'Maadi' }
    ];

    hotspots.forEach((hotspot, index) => {
      mockData.push({
        lat: hotspot.lat + (Math.random() - 0.5) * 0.01,
        lng: hotspot.lng + (Math.random() - 0.5) * 0.01,
        intensity: 0.8 + Math.random() * 0.2,
        timestamp: new Date().toISOString(),
        id: `hotspot_${index}`,
        type: 'hotspot'
      });
    });

    return mockData;
  }

  // Method to update API configuration
  updateConfig(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }
}

export const ExternalVibeAPI = new ExternalVibeAPIService();