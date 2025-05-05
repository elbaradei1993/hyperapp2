
import React, { useRef, useEffect, useState } from 'react';
import { TrendingUp, Map, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { VibeService, VibeType } from '@/services/VibeService';
import { Loader2 } from 'lucide-react';

const Banner = () => {
  const [vibeTypes, setVibeTypes] = useState<VibeType[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  
  useEffect(() => {
    const fetchVibeTypes = async () => {
      try {
        const types = await VibeService.getVibeTypes();
        setVibeTypes(types);
      } catch (error) {
        console.error('Error fetching vibe types:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVibeTypes();
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 150;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };
  
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setShowLeftScroll(container.scrollLeft > 0);
    setShowRightScroll(container.scrollLeft < (container.scrollWidth - container.clientWidth - 10));
  };
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [vibeTypes]);
  
  return (
    <div className="w-full overflow-hidden relative mb-4">
      <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500 p-4 rounded-xl shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white text-lg">HyperApp</h2>
              <p className="text-white/80 text-sm mt-1">Discover the pulse of your community</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/20 h-8 w-8 rounded-full flex items-center justify-center">
                <Map className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white/20 h-8 w-8 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white/20 h-8 w-8 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          ) : (
            <div className="relative">
              {showLeftScroll && (
                <button 
                  onClick={() => scroll('left')} 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-6 w-6 bg-white/30 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="h-4 w-4 text-white" />
                </button>
              )}
              
              <div 
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto scrollbar-none py-1 px-1 -mx-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {vibeTypes.map(type => (
                  <div 
                    key={type.id}
                    className="flex-shrink-0 px-3 py-1 rounded-full flex items-center gap-1.5"
                    style={{ backgroundColor: `${type.color}30` }}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    ></span>
                    <span className="text-xs font-medium text-white whitespace-nowrap">{type.name}</span>
                  </div>
                ))}
              </div>
              
              {showRightScroll && (
                <button 
                  onClick={() => scroll('right')} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-6 w-6 bg-white/30 rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Abstract shape overlays */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-10 w-16 h-16 bg-purple-300/20 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default Banner;
