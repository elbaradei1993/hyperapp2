
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Vibe {
  id: string;
  type: "calm" | "noisy" | "dangerous" | "lgbtq";
  title: string;
  description: string;
  location: string;
  time: string;
  votes: { up: number; down: number };
}

const sampleVibes: Vibe[] = [
  {
    id: "1",
    type: "calm",
    title: "Central Park - Really peaceful today",
    description: "Perfect for meditation or reading a book. Not crowded at all.",
    location: "Central Park, NY",
    time: "1 hour ago",
    votes: { up: 42, down: 5 },
  },
  {
    id: "2",
    type: "dangerous",
    title: "Avoid South District after dark",
    description: "Witnessed some suspicious activity. Stay safe everyone.",
    location: "South District",
    time: "30 minutes ago",
    votes: { up: 89, down: 2 },
  },
  {
    id: "3",
    type: "noisy",
    title: "Construction work on Main Street",
    description: "Heavy machinery noise. Expected to continue for a week.",
    location: "Main Street",
    time: "2 hours ago",
    votes: { up: 17, down: 3 },
  },
  {
    id: "4",
    type: "lgbtq",
    title: "Rainbow Cafe - LGBTQIA+ Friendly Space",
    description: "Great atmosphere and inclusive environment. Highly recommended!",
    location: "Downtown",
    time: "45 minutes ago",
    votes: { up: 63, down: 0 },
  }
];

const VibesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vibes, setVibes] = useState(sampleVibes);

  const filteredVibes = vibes.filter(vibe => 
    vibe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    vibe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVibeColor = (type: string) => {
    switch (type) {
      case "calm": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "dangerous": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "noisy": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "lgbtq": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search vibes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-sm border border-white/10"
        />
      </div>
      
      {/* Vibes list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredVibes.map((vibe) => (
          <Card key={vibe.id} className="border border-white/10 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getVibeColor(vibe.type)}`}>
                  {vibe.type.charAt(0).toUpperCase() + vibe.type.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {vibe.time}
                </span>
              </div>
              
              <h3 className="font-semibold mb-1">{vibe.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {vibe.location}
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">{vibe.votes.up}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">{vibe.votes.down}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VibesTab;
