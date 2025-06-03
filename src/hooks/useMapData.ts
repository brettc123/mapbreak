import { useState, useEffect } from 'react';
import { MapLocation, MapState, ImageTag } from '../types/Map';
import { getMapOfTheDay, getMapEntries, searchMaps as searchContentfulMaps, getImageTags } from '../lib/contentful'; // ✅ Fixed import path

export const useMapData = () => {
  const [state, setState] = useState<MapState>({
    currentMap: null,
    favoriteMapIds: [],
    viewedMapIds: [],
    searchQuery: '',
    isLoading: true,
    error: null,
    archiveMaps: [],
    imageTags: []
  });

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        console.log('🔄 Loading initial data...');
        
        const [mapOfTheDay, archiveMaps, imageTags] = await Promise.all([
          getMapOfTheDay(),
          getMapEntries(),
          getImageTags()
        ]);
        
        console.log('📊 Data loaded:', {
          mapOfTheDay: mapOfTheDay?.name,
          archiveCount: archiveMaps?.length,
          imageTagsCount: imageTags?.length
        });
        
        // ✅ Use in-memory storage instead of localStorage for now
        // TODO: Replace with Capacitor Preferences for persistent storage
        let favoriteMapIds: string[] = [];
        let viewedMapIds: string[] = [];
        
        // Try to get from localStorage safely
        try {
          const savedFavorites = window?.localStorage?.getItem('favoriteMapIds');
          favoriteMapIds = savedFavorites ? JSON.parse(savedFavorites) : [];
          
          const savedViewed = window?.localStorage?.getItem('viewedMapIds');
          viewedMapIds = savedViewed ? JSON.parse(savedViewed) : [];
        } catch (e) {
          console.warn('localStorage not available, using in-memory storage');
        }
        
        setState(prev => ({
          ...prev,
          currentMap: mapOfTheDay,
          favoriteMapIds,
          viewedMapIds,
          isLoading: false,
          archiveMaps: archiveMaps.filter(map => map.id !== mapOfTheDay.id),
          imageTags,
          // Initialize searchResults with the 5 most recent posts
          searchResults: archiveMaps.slice(0, 5)
        }));
        
        // Mark current map as viewed
        if (mapOfTheDay && !viewedMapIds.includes(mapOfTheDay.id)) {
          const newViewedIds = [...viewedMapIds, mapOfTheDay.id];
          try {
            window?.localStorage?.setItem('viewedMapIds', JSON.stringify(newViewedIds));
          } catch (e) {
            console.warn('Could not save to localStorage');
          }
          setState(prev => ({
            ...prev,
            viewedMapIds: newViewedIds
          }));
        }
      } catch (error) {
        console.error('❌ Failed to load initial data:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load map data',
          isLoading: false
        }));
      }
    }

    loadInitialData();
  }, []);

  // Toggle favorite status
  const toggleFavorite = (mapId: string) => {
    setState(prev => {
      const newFavorites = prev.favoriteMapIds.includes(mapId)
        ? prev.favoriteMapIds.filter(id => id !== mapId)
        : [...prev.favoriteMapIds, mapId];
      
      try {
        window?.localStorage?.setItem('favoriteMapIds', JSON.stringify(newFavorites));
      } catch (e) {
        console.warn('Could not save favorites to localStorage');
      }
      
      return {
        ...prev,
        favoriteMapIds: newFavorites
      };
    });
  };

  // Get a random map
  const getRandomMap = async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      const maps = await getMapEntries();
      const randomIndex = Math.floor(Math.random() * maps.length);
      const randomMap = maps[randomIndex];
      
      setState(prev => ({
        ...prev,
        currentMap: randomMap,
        isLoading: false
      }));
    } catch (error) {
      console.error('❌ Failed to get random map:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get random map',
        isLoading: false
      }));
    }
  };

  // Set current map
  const setCurrentMap = (map: MapLocation) => {
    setState(prev => ({
      ...prev,
      currentMap: map
    }));
    
    // Mark as viewed
    if (!state.viewedMapIds.includes(map.id)) {
      const newViewedIds = [...state.viewedMapIds, map.id];
      try {
        window?.localStorage?.setItem('viewedMapIds', JSON.stringify(newViewedIds));
      } catch (e) {
        console.warn('Could not save viewed maps to localStorage');
      }
      setState(prev => ({
        ...prev,
        viewedMapIds: newViewedIds
      }));
    }
  };

  // Enhanced search function that also handles tag filtering
  const handleSearch = async (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      isLoading: true
    }));

    try {
      let results;
      
      if (query) {
        // First try to search via Contentful's search API
        let searchResults = await searchContentfulMaps(query);
        
        // If no results or if this looks like a tag search, also try filtering by tag
        if (searchResults.length === 0 || query.includes(',') === false) {
          // Get all maps if we haven't already loaded them
          const allMaps = state.archiveMaps.length > 0 
            ? [...state.archiveMaps]
            : await getMapEntries();
          
          // Also include current map in the search
          if (state.currentMap) {
            allMaps.push(state.currentMap);
          }
          
          // Filter maps that have the query as a tag
          const tagFilteredMaps = allMaps.filter(map => {
            // Process tags to a normalized array
            let mapTags: string[] = [];
            
            if (Array.isArray(map.tags)) {
              mapTags = map.tags.flatMap(tag => 
                typeof tag === 'string' ? tag.split(',').map(t => t.trim()) : []
              );
            } else if (typeof map.tags === 'string') {
              mapTags = map.tags.split(',').map(t => t.trim());
            }
            
            // Check if any tag matches the query (case insensitive)
            return mapTags.some(tag => 
              tag.toLowerCase() === query.toLowerCase()
            );
          });
          
          // Combine search results with tag-filtered results, removing duplicates
          const combinedResults = [...searchResults];
          
          tagFilteredMaps.forEach(map => {
            if (!combinedResults.some(m => m.id === map.id)) {
              combinedResults.push(map);
            }
          });
          
          results = combinedResults;
        } else {
          results = searchResults;
        }
      } else {
        // If no query, get the 5 most recent posts
        const allMaps = state.archiveMaps.length > 0 
          ? state.archiveMaps
          : await getMapEntries();
        
        results = allMaps.slice(0, 5);
      }
      
      setState(prev => ({
        ...prev,
        searchResults: results,
        isLoading: false
      }));
    } catch (error) {
      console.error('❌ Search failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Search failed',
        isLoading: false,
        searchResults: []
      }));
    }
  };

  return {
    ...state,
    toggleFavorite,
    handleSearch,
    getRandomMap,
    setCurrentMap
  };
};