
"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/hooks/use-toast";

const vibeTypes = ["Happy", "Chill", "Excited", "Sad", "Neutral"];

interface VibeData {
  type: string;
  description: string;
  anonymous: boolean;
  location: { lat: number; lng: number } | null;
}

const VibeModal = ({ onReport }: { onReport: (data: VibeData) => void }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(vibeTypes[0]);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setLocation(null)
      );
    } else setLocation(null);
  }, [open]);

  const handleSubmit = () => {
    if (!description) {
      toast({
        title: "Validation Error",
        description: "Please enter a description",
        duration: 3000,
      });
      return;
    }
    onReport({ type, description, anonymous, location });
    setOpen(false);
    setType(vibeTypes[0]);
    setDescription("");
    setAnonymous(false);
    toast({
      title: "Vibe Sent",
      description: "Your vibe has been successfully posted.",
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-24 right-24 z-30 rounded-full w-16 h-16 shadow-lg flex items-center justify-center"
        >
          +
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post a Vibe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="vibe-type">Vibe Type</Label>
            <select
              id="vibe-type"
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {vibeTypes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
              className="h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Post Anonymously</span>
          </label>
          {location && (
            <p className="text-xs text-gray-500 mt-1">
              Location detected: {location.lat.toFixed(4)},{location.lng.toFixed(4)}
            </p>
          )}
          {!location && (
            <p className="text-xs text-red-500 mt-1">
              Unable to detect location
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Post Vibe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VibeModal;
