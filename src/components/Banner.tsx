
import React from 'react';
import { TrendingUp, Map, AlertTriangle } from 'lucide-react';

const Banner = () => {
  return (
    <div className="w-full overflow-hidden relative mb-4">
      <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500 p-4 rounded-xl shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-lg">Stay Connected</h2>
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
        </div>
        
        {/* Abstract shape overlays */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-10 w-16 h-16 bg-purple-300/20 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default Banner;
