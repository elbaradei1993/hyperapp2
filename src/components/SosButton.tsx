
import React from 'react';
import { Button } from '@/components/ui/button';

const SosButton = () => {
  return (
    <Button
      variant="destructive"
      size="sm"
      className="fixed bottom-20 right-6 z-30 rounded-full shadow-lg px-4 py-2 animate-pulse"
      onClick={() => window.location.href = '/sos'}
    >
      SOS
    </Button>
  );
};

export default SosButton;
