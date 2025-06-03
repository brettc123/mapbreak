// src/components/TagPage.tsx
import React, { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MapLocation } from '../types/Map';

// Include MobileHeader directly
function MobileHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="md:hidden fixed inset-x-0 top-0 pt-safe bg-white dark:bg-gray-800 shadow px-4 py-2 z-50">
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-compass-600 dark:text-white" />
        </button>
        <h1 className="text-xl font-display font-bold text-compass-800 dark:text-white">
          {title}
        </h1>
      </div>
    </div>
  );
}

function TagPage({ 
  tag,
  maps,
  onSelectMap,
  onBack
}: {
  tag: string;
  maps: MapLocation[];
  onSelectMap: (map: MapLocation) => void;
  onBack: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Force scroll to top on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }, []);
  
  return (
    <>
      {/* Mobile header with back button */}
      <MobileHeader title={tag} onBack={onBack} />
      
      {/* Desktop header with back button */}
      <div className="hidden md:flex items-center bg-white dark:bg-gray-800 border-b px-6 py-4 fixed top-0 left-0 right-0 z-50">
        <button 
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-compass-600 dark:text-white" />
        </button>
        <h2 className="text-2xl font-display font-bold text-compass-800 dark:text-white">
          {tag}
        </h2>
      </div>
      
      {/* Scrollable content with absolute positioning */}
      <div 
        ref={contentRef}
        className="absolute top-[calc(env(safe-area-inset-top)+3rem)] bottom-0 left-0 right-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }} // for momentum scrolling on iOS
      >
        <div className="px-4 py-3">
          <div className="mb-4">
            <p className="text-compass-600 dark:text-gray-400">
              {maps.length} {maps.length === 1 ? 'map' : 'maps'} tagged with "{tag}"
            </p>
          </div>
          
          {/* Map grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {maps.map((map) => (
              <div
                key={map.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectMap(map)}
              >
                <img 
                  src={map.imageUrl} 
                  alt={map.name} 
                  className="w-full h-48 object-cover rounded-t-lg" 
                />
                <div className="p-4">
                  <h3 className="font-display font-semibold text-compass-800 dark:text-white">
                    {map.name}
                  </h3>
                  {map.shortDescription && (
                    <p className="text-sm text-compass-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {map.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional padding at the bottom */}
          <div className="h-24"></div>
        </div>
      </div>
    </>
  );
}

export default TagPage;