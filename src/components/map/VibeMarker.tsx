
import React, { useState, useEffect } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import { Rainbow } from 'lucide-react';
import { VibeService } from '@/services/vibes';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VibeMarkerProps {
  vibe: any;
  position: [number, number];
}

const VibeMarker: React.FC<VibeMarkerProps> = ({ vibe, position }) => {
  const [isLGBTQIAFriendly, setIsLGBTQIAFriendly] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is LGBTQIA+ friendly vibe based on vibe_type name
    if (vibe?.vibe_type?.name?.toLowerCase().includes('lgbtq')) {
      setIsLGBTQIAFriendly(true);
    }
  }, [vibe]);

  const handleConfirmVibe = async (id: number) => {
    try {
      setIsUpvoting(true);
      await VibeService.upvoteVibe(id);
      
      toast({
        title: "Vibe confirmed",
        description: "Thanks for confirming this vibe!",
      });
    } catch (error) {
      console.error("Error confirming vibe:", error);
      toast({
        title: "Failed to confirm vibe",
        description: "Could not register your confirmation",
        variant: "destructive"
      });
    } finally {
      setIsUpvoting(false);
    }
  };

  // Create SVG element for rainbow gradient
  const rainbowGradientSvg = (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea384c" />
          <stop offset="16.6%" stopColor="#F97316" />
          <stop offset="33.3%" stopColor="#FEF7CD" />
          <stop offset="50%" stopColor="#F2FCE2" />
          <stop offset="66.6%" stopColor="#0EA5E9" />
          <stop offset="83.3%" stopColor="#7E69AB" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <>
      {/* Rainbow gradient definition for SVG elements */}
      {isLGBTQIAFriendly && rainbowGradientSvg}
      
      {/* Main vibe circle - smaller radius (100m) to not obstruct map details */}
      <Circle 
        center={position}
        pathOptions={{ 
          color: isLGBTQIAFriendly ? '#D946EF' : vibe.vibe_type?.color || '#888888',
          fillColor: isLGBTQIAFriendly ? '#D946EF' : vibe.vibe_type?.color || '#888888',
          fillOpacity: 0.4,
          weight: 1
        }}
        // Fix: Use TypeScript type assertion for the radius property
        {...{ radius: 100 } as any}
      />
      
      {/* Pulse circles with animation - 5km max radius (5000m) with reduced opacity */}
      {[1000, 3000, 5000].map((radius, i) => (
        <Circle 
          key={`pulse-${vibe.id}-${i}`}
          center={position}
          pathOptions={{ 
            color: isLGBTQIAFriendly ? '#D946EF' : vibe.vibe_type?.color || '#888888',
            fillColor: isLGBTQIAFriendly ? '#D946EF' : vibe.vibe_type?.color || '#888888',
            fillOpacity: 0.04 - (i * 0.01), // Very low opacity to ensure map is still readable
            weight: 1,
            dashArray: '5, 10',
            className: `animate-pulse-slow`
          }}
          // Fix: Use TypeScript type assertion for the radius property
          {...{ radius: radius } as any}
        />
      ))}
      
      {/* Marker */}
      <Marker position={position}>
        <Popup>
          <div className="p-1">
            <h3 className="font-medium text-sm">{vibe.title || "Unnamed Vibe"}</h3>
            <p className="text-xs text-muted-foreground mt-1">{vibe.description || "No description provided"}</p>
            {vibe.vibe_type && (
              <div className="flex items-center gap-1 mt-2">
                {isLGBTQIAFriendly ? (
                  <Rainbow className="h-3 w-3" />
                ) : (
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vibe.vibe_type.color }}
                  />
                )}
                <span className="text-xs">{vibe.vibe_type.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {vibe.confirmed_count} confirmations
              </span>
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-7 text-xs"
                onClick={() => handleConfirmVibe(vibe.id)}
                disabled={isUpvoting}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {isUpvoting ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default VibeMarker;
