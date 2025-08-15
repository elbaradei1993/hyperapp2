
import React, { useState } from 'react';
import { PlusCircle, AlertTriangle, MapPin, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SosButtonHome from './SosButtonHome';
import AddVibeReportDialog from './AddVibeReportDialog';

interface ActionButtonProps {
  isMobile: boolean;
}

const ActionButton = ({ isMobile }: ActionButtonProps) => {
  const [isSosDialogOpen, setIsSosDialogOpen] = useState(false);

  if (isMobile) {
    // Mobile version - centered in navbar
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="h-14 w-14 rounded-full shadow-lg shadow-primary/20 bg-primary text-white"
            size="icon"
          >
            <PlusCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <AddVibeReportDialog 
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Add Vibe Report</span>
              </DropdownMenuItem>
            } 
          />
          <DropdownMenuItem asChild>
            <NavLink to="/events" className="cursor-pointer">
              <Calendar className="mr-2 h-4 w-4" />
              <span>View Events</span>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-500 hover:text-red-600 cursor-pointer"
            onClick={() => setIsSosDialogOpen(true)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>SOS Alert</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Desktop version - in navbar
  return (
    <div className="flex items-center space-x-2">
      <AddVibeReportDialog 
        trigger={
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Add Vibe
          </Button>
        } 
      />
      <Button size="sm" variant="outline" className="flex items-center gap-1" asChild>
        <NavLink to="/events">
          <Calendar className="h-4 w-4" />
          View Events
        </NavLink>
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        className="flex items-center gap-1"
        onClick={() => setIsSosDialogOpen(true)}
      >
        <AlertTriangle className="h-4 w-4" />
        SOS
      </Button>
      
      {/* Always rendering SosButtonHome but controlling visibility with open prop */}
      <SosButtonHome 
        open={isSosDialogOpen} 
        onOpenChange={setIsSosDialogOpen}
      />
    </div>
  );
};

export default ActionButton;
