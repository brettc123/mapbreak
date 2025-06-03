// src/components/SearchScreen.tsx
import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { MapLocation } from '../types/Map';

// Include MobileHeader directly
function MobileHeader({ title }: { title: string }) {
  return (
    <div className="md:hidden fixed inset-x-0 top-0 pt-safe bg-white dark:bg-gray-800 shadow px-4 py-2 z-50">
      <h1 className="text-xl font-display font-bold text-compass-800 dark:text-white">
        {title}
      </h1>
    </div>
  );
}

function SearchScreen({ 
  searchQuery, 
  handleSearch, 
  searchResults, 
  archiveMaps, 
  onCardClick,
  onTagClick,
  isLoading
}: {
  searchQuery: string;
  handleSearch: (query: string) => void;
  searchResults: MapLocation[] | null;
  archiveMaps: MapLocation[];
  onCardClick: (map: MapLocation) => void;
  onTagClick: (tag: string) => void;
  isLoading?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Force scroll to top on mount and when tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }, []);
  
  // The maps to display
  const mapsToDisplay = searchResults || archiveMaps;
  
  // Handle tag click without event propagation
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation(); // Prevent the click from triggering the parent card's onClick
    onTagClick(tag);
  };
  
  return (
    <>
      {/* Fixed header */}
      <MobileHeader title={searchQuery ? `Search: ${searchQuery}` : 'Search'} />
      
      {/* Fixed search bar */}
      <div className="fixed top-[calc(env(safe-area-inset-top)+3rem)] left-0 right-0 bg-white dark:bg-gray-800 shadow z-40">
        <div className="px-4 py-3">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search maps..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-compass-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-compass-400" />
          </div>
        </div>
      </div>
      
      {/* Scrollable content with fixed positioning for header and search bar */}
      <div 
        ref={contentRef}
        className="absolute top-[calc(env(safe-area-inset-top)+7rem)] bottom-20 left-0 right-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }} // for momentum scrolling on iOS
      >
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-compass-700"></div>
            </div>
          ) : (
            <>
              {/* Results title */}
              {(searchQuery || mapsToDisplay.length > 0) && (
                <div className="py-3">
                  <h2 className="text-xl font-display font-bold text-compass-800 dark:text-white">
                    {searchQuery 
                      ? `${searchResults?.length || 0} results for "${searchQuery}"`
                      : 'Recent maps'
                    }
                  </h2>
                </div>
              )}
              
              {/* Map grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {mapsToDisplay.length > 0 ? (
                  mapsToDisplay.map((map) => (
                    <div
                      key={map.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onCardClick(map)}
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
                        
                        {/* Display tags - make sure they're clickable */}
                        {map.tags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(Array.isArray(map.tags) 
                              ? map.tags.flatMap(t => typeof t === 'string' ? t.split(',').map(s => s.trim()) : [])
                              : typeof map.tags === 'string' 
                                ? map.tags.split(',').map(s => s.trim()) 
                                : []
                            ).filter(Boolean).map((tag, i) => (
                              <button 
                                key={`${tag}-${i}`} 
                                type="button"
                                className="px-2 py-1 bg-terrain-100 text-terrain-800 rounded-full text-xs cursor-pointer hover:bg-terrain-200 transition-colors"
                                onClick={(e) => handleTagClick(e, tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-compass-600 dark:text-gray-400">
                      No maps found. Try a different search term.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchScreen;