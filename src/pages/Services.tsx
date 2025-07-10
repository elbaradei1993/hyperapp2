import React, { useState } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  AlertTriangle, 
  Calendar,
  Plus,
  Shield,
  Users,
  MapPin
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddVibeModal } from "@/components/modals/AddVibeModal";
import SosModal from "@/components/SosModal";

const services = [
  {
    icon: MessageSquare,
    title: "Report Vibe",
    description: "Share what's happening in your area",
    color: "text-blue-500",
    action: "report-vibe"
  },
  {
    icon: AlertTriangle,
    title: "Send SOS",
    description: "Emergency alert for immediate assistance",
    color: "text-red-500",
    action: "send-sos"
  },
  {
    icon: Calendar,
    title: "Create Event",
    description: "Organize community gatherings and activities",
    color: "text-green-500",
    action: "create-event"
  }
];

const features = [
  {
    icon: Shield,
    title: "Anonymous Reporting",
    description: "Report incidents while protecting your privacy"
  },
  {
    icon: Users,
    title: "Community Network",
    description: "Connect with neighbors and local responders"
  },
  {
    icon: MapPin,
    title: "Location-Based",
    description: "Hyperlocal awareness for your immediate area"
  }
];

export const Services = () => {
  const isMobile = useIsMobile();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleServiceAction = (action: string) => {
    setActiveModal(action);
  };

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community Services
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Keep your community safe and connected with our suite of real-time 
            reporting and communication tools.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {services.map((service) => {
            const Icon = service.icon;
            
            return (
              <div
                key={service.title}
                className="feature-card text-center group"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-full bg-muted group-hover:scale-110 transition-transform ${service.color}`}>
                    <Icon size={32} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                  
                  <Button 
                    onClick={() => handleServiceAction(service.action)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2" size={16} />
                    {service.title}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Choose HyperAPP?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              
              return (
                <div key={feature.title} className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="text-primary" size={24} />
                    </div>
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddVibeModal 
        isOpen={activeModal === "report-vibe"}
        onClose={() => setActiveModal(null)}
      />
      
      <SosModal 
        onReport={(data) => {
          console.log('SOS reported:', data);
          setActiveModal(null);
        }}
      />

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Services;