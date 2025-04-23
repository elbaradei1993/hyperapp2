
"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const sosTypes = [
  { id: "violence", label: "Violence" },
  { id: "panic", label: "Panic" },
  { id: "medical", label: "Medical" },
];

interface SosData {
  type: string;
  anonymous: boolean;
}

const SosModal = ({ onReport }: { onReport: (data: SosData) => void }) => {
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState<string>("violence");
  const [anonymous, setAnonymous] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    onReport({ type: alertType, anonymous });
    setOpen(false);
    toast({
      title: "SOS Alert Sent",
      description: "Your SOS alert was successfully reported.",
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="fixed bottom-24 right-6 z-30 rounded-full w-16 h-16 shadow-lg flex items-center justify-center text-white">
          SOS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report SOS Alert</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <RadioGroup value={alertType} onValueChange={setAlertType} className="flex flex-col space-y-2">
            {sosTypes.map((sos) => (
              <div key={sos.id} className="flex items-center space-x-2">
                <RadioGroupItem value={sos.id} id={sos.id} />
                <label htmlFor={sos.id} className="cursor-pointer">
                  {sos.label}
                </label>
              </div>
            ))}
          </RadioGroup>
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
              className="h-4 w-4 rounded border border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm">Report Anonymously</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleSubmit}>
            Send Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SosModal;
