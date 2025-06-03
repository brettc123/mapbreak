// src/components/ExploreScreen.tsx
import React, { useEffect, useRef } from 'react';
import { MapLocation, ImageTag } from '../types/Map';

// Include MobileHeader directly in this file
function MobileHeader({ title }: { title: string }) {
  return (
    <div className="md:hidden fixed inset-x-0 top-0 pt-safe bg-white dark:bg-gray-800 shadow px-4 py-2 z-50">
      <h1 className="text-xl font-display font-bold text-compass-800 dark:text-white">
        {title}
      </h1>
    </div>
  );
}

function ExploreScreen({
  archiveMaps,
  currentMap,
  imageTags,
  onTagClick,
}: {
  archiveMaps: MapLocation[];
  currentMap: MapLocation | null;
  imageTags: ImageTag[];
  onTagClick: (tag: string) => void;
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
  
  // Extract all unique tags from maps
  const getAllTags = () => {
    const tagSet = new Set<string>();
    
    // Helper function to process tags from a map
    const processTags = (map: MapLocation | null) => {
      if (!map) return;
      
      if (Array.isArray(map.tags)) {
        map.tags.forEach(tag => {
          if (typeof tag === 'string') {
            tag.split(',').forEach(t => {
              const trimmed = t.trim();
              if (trimmed) tagSet.add(trimmed);
            });
          }
        });
      } else if (typeof map.tags === 'string') {
        map.tags.split(',').forEach(t => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    };
    
    // Process current map and archive maps
    if (currentMap) processTags(currentMap);
    (archiveMaps || []).forEach(processTags);
    
    // If imageTags are provided, add those as well
    // But check if they're valid first
    if (Array.isArray(imageTags)) {
      imageTags.forEach(tag => {
        if (tag && typeof tag === 'object' && tag.name) {
          tagSet.add(tag.name);
        }
      });
    }
    
    return Array.from(tagSet).sort();
  };
  
  const tags = getAllTags();
  
  // Find an image for a tag (safely handling undefined values)
  const getTagImage = (tagName: string): string | undefined => {
    // First check if the tag has a dedicated image in imageTags
    if (Array.isArray(imageTags)) {
      const imageTag = imageTags.find(t => 
        t && 
        typeof t === 'object' && 
        t.name && 
        typeof t.name === 'string' && 
        t.name.toLowerCase() === tagName.toLowerCase()
      );
      
      if (imageTag?.imageUrl) return imageTag.imageUrl;
    }
    
    // Otherwise find the first map that has this tag
    const mapsToCheck = [currentMap, ...(archiveMaps || [])].filter(Boolean);
    
    for (const map of mapsToCheck) {
      if (!map) continue;
      
      let mapTags: string[] = [];
      if (Array.isArray(map.tags)) {
        mapTags = map.tags.flatMap(t => 
          typeof t === 'string' ? t.split(',').map(s => s.trim()) : []
        );
      } else if (typeof map.tags === 'string') {
        mapTags = map.tags.split(',').map(s => s.trim());
      }
      
      if (mapTags.some(t => t.toLowerCase() === tagName.toLowerCase())) {
        return map.imageUrl;
      }
    }
    
    return undefined;
  };
  
  return (
    <>
      {/* Fixed header */}
      <MobileHeader title="Explore!" />
      
      {/* Scrollable content with absolute positioning */}
      <div 
        ref={contentRef}
        className="absolute top-[calc(env(safe-area-inset-top)+3rem)] bottom-20 left-0 right-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }} // for momentum scrolling on iOS
      >
        <div className="px-4 py-3">
          {tags.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tags.map((tag) => {
                const tagImage = getTagImage(tag);
                
                return (
                  <div
                    key={tag}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => onTagClick(tag)}
                  >
                    {/* Use the tag's image or a map image containing that tag */}
                    <div 
                      className="absolute inset-0 bg-gray-800 flex items-center justify-center" 
                      style={tagImage ? { 
                        backgroundImage: `url(${tagImage})`, 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {}}
                    >
                      {/* Semi-transparent overlay to make text more readable */}
                      <div className="absolute inset-0 bg-black/40"></div>
                      
                      {/* Tag name */}
                      <h3 className="text-white font-display text-xl font-bold relative z-10">
                        {tag}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center h-60">
              <p className="text-compass-600 dark:text-gray-400 text-center">
                No tags found. Add tags to your maps to see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ExploreScreen;