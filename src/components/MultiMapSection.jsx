import React, { useState, useEffect } from 'react';
import InteractiveMap from './InteractiveMap';

function MultiMapSection({ mapSections = [] }) {
  const [visibleMaps, setVisibleMaps] = useState(new Set());
  
  // Only render maps when they come into view (performance optimization)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const mapIndex = parseInt(entry.target.dataset.mapIndex);
          if (entry.isIntersecting) {
            setVisibleMaps(prev => new Set([...prev, mapIndex]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    // Observe all map containers
    document.querySelectorAll('[data-map-index]').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [mapSections]);
  
  if (!mapSections || mapSections.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-8 mt-6">
      {mapSections.map((section, index) => (
        <div key={index} className="mb-8">
          {/* Section title and description */}
          <div className="mb-4">
            <h3 className="text-2xl font-display font-bold text-compass-800 dark:text-white mb-2">
              {section.title || `Map ${index + 1}`}
            </h3>
            {section.description && (
              <p className="text-compass-700 dark:text-gray-300 mb-4">
                {section.description}
              </p>
            )}
          </div>
          
          {/* Map container */}
          {console.log("=== SECTION DEBUG ===", {
  mapStyle: section.mapStyle,
  fallbackStyle: "https://api.maptiler.com/maps/streets/style.json?key=OnmsIibZBnz9Mb3wEoJX",
  finalStyle: section.mapStyle || "https://api.maptiler.com/maps/streets/style.json?key=OnmsIibZBnz9Mb3wEoJX"
})}
          <div 
            className="h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
            data-map-index={index}
          >
            {visibleMaps.has(index) ? (
             <InteractiveMap
  coordinates={section.coordinates}
  markers={section.markers}
  initialZoom={section.zoom}
  mapStyleKey={section.mapStyle}
/>
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-pulse">Loading map...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MultiMapSection;