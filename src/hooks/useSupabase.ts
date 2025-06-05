import { useState, useEffect } from 'react';
import { MapLocation, MapState, ImageTag } from '../types/Map';
import { getMapOfTheDay, getMapEntries, searchMaps as searchContentfulMaps, getImageTags } from '../lib/contentful';
import { useSupabase } from './useSupabase'; // Add this import

export const useMapData = () => {
  const { user, supabase } = useSupabase(); // Add Supabase integration
  
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

  // Load favorites from database when user changes
  useEffect(() => {
    if (user) {
      loadFavoritesFromDB();
    } else {
      // If no user, try to load from localStorage as fallback
      loadFavoritesFromLocalStorage();
    }
  }, [user]);

  const loadFavoritesFromDB = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('map_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading favorites:', error);
        return;
      }
      
      const favoriteIds = data.map(item => item.map_id);
      setState(prev => ({
        ...prev,
        favoriteMapIds: favoriteIds
      }));
      
      console.log('✅ Loaded favorites from database:', favoriteIds);
      
    } catch (error) {
      console.error('❌ Error loading favorites from database:', error);
    }
  };

  const loadFavoritesFromLocalStorage = () => {
    try {
      const savedFavorites = window?.localStorage?.getItem('favoriteMapIds');
      const favoriteMapIds = savedFavorites ? JSON.parse(savedFavorites) : [];
      setState(prev => ({
        ...prev,
        favoriteMapIds
      }));
    } catch (e) {
      console.warn('Could not load favorites from localStorage');
    }
  };

  const addFavoriteToDB = async (map: MapLocation) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          map_id: map.id,
          map_name: map.name,
          map_image_url: map.imageUrl,
          map_short_description: map.shortDescription,
        });
      
      if (error) throw error;
      console.log('✅ Favorite added to database');
      
    } catch (error) {
      console.error('❌ Error adding favorite to database:', error);
      throw error;
    }
  };

  const removeFavoriteFromDB = async (mapId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('map_id', mapId);
      
      if (error) throw error;
      console.log('✅ Favorite removed from database');
      
    } catch (error) {
      console.error('❌ Error removing favorite from database:', error);
      throw error;
    }
  };

  // Track search usage in database
  const incrementSearchCount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('increment_search_count', {
        user_uuid: user.id
      });
      
      if (error) {
        console.error('Error incrementing search count:', error);
        return;
      }
      
      console.log('Search count incremented to:', data);
      return data;
      
    } catch (error) {
      console.error('Error incrementing search count:', error);
    }
  };

  // Get user's current daily usage
  const getDailyUsage = async () => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase.rpc('get_user_daily_usage', {
        user_uuid: user.id
      });
      
      if (error) {
        console.error('Error getting daily usage:', error);
        return 0;
      }
      
      return data || 0;
      
    } catch (error) {
      console.error('Error getting daily usage:', error);
      return 0;
    }
  };

  // Enhanced function to get subscription limits
  const getSubscriptionLimits = (subscription: any) => {
    const isSubscribed = subscription?.subscription_status === 'active';
    
    return {
      dailySearches: isSubscribed ? Infinity : 5,
      maxFavorites: isSubscribed ? Infinity : 10,
      canDownload: isSubscribed,
      hasAds: !isSubscribed
    };
  };

  // Function to check if user can perform an action
  const canPerformAction = async (action: 'search' | 'favorite', subscription: any) => {
    const limits = getSubscriptionLimits(subscription);
    
    switch (action) {
      case 'search':
        if (limits.dailySearches === Infinity) return true;
        const currentUsage = await getDailyUsage();
        return currentUsage < limits.dailySearches;
        
      case 'favorite':
        if (limits.maxFavorites === Infinity) return true;
        return state.favoriteMapIds.length < limits.maxFavorites;
        
      default:
        return true;
    }
  };

  // Load initial data (your existing function, enhanced)
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
        
        // Load viewed maps from localStorage (keep this for now)
        let viewedMapIds: string[] = [];
        try {
          const savedViewed = window?.localStorage?.getItem('viewedMapIds');
          viewedMapIds = savedViewed ? JSON.parse(savedViewed) : [];
        } catch (e) {
          console.warn('localStorage not available, using in-memory storage');
        }
        
        setState(prev => ({
          ...prev,
          currentMap: mapOfTheDay,
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

  // Enhanced toggle favorite with database integration
  const toggleFavorite = async (mapId: string) => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    const isCurrentlyFavorited = state.favoriteMapIds.includes(mapId);
    const map = getCurrentMapData(mapId);
    
    try {
      if (isCurrentlyFavorited) {
        // Remove from database
        await removeFavoriteFromDB(mapId);
        // Update local state
        setState(prev => ({
          ...prev,
          favoriteMapIds: prev.favoriteMapIds.filter(id => id !== mapId)
        }));
      } else {
        // Add to database
        if (map) {
          await addFavoriteToDB(map);
          // Update local state
          setState(prev => ({
            ...prev,
            favoriteMapIds: [...prev.favoriteMapIds, mapId]
          }));
        } else {
          console.error('Map data not found for ID:', mapId);
        }
      }
      
      // Also update localStorage as backup
      try {
        const newFavorites = isCurrentlyFavorited 
          ? state.favoriteMapIds.filter(id => id !== mapId)
          : [...state.favoriteMapIds, mapId];
        window?.localStorage?.setItem('favoriteMapIds', JSON.stringify(newFavorites));
      } catch (e) {
        console.warn('Could not save favorites to localStorage');
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Fallback to localStorage-only behavior
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
    }
  };

  const getCurrentMapData = (mapId: string): MapLocation | null => {
    // Check current map first
    if (state.currentMap?.id === mapId) {
      return state.currentMap;
    }
    
    // Check archive maps
    const foundMap = state.archiveMaps.find(map => map.id === mapId);
    if (foundMap) {
      return foundMap;
    }
    
    // Check global tracker (from your existing system)
    if (window.__mapTracker?.mapsById?.[mapId]) {
      return window.__mapTracker.mapsById[mapId];
    }
    
    return null;
  };

  // Enhanced getRandomMap with search tracking
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

      // Track this as a search if user is authenticated
      if (user) {
        await incrementSearchCount();
      }
      
    } catch (error) {
      console.error('❌ Failed to get random map:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to get random map',
        isLoading: false
      }));
    }
  };

  // Enhanced setCurrentMap (your existing function)
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

    // Make sure current map is available globally for favorites
    if (window.__mapTracker && map) {
      window.__mapTracker.mapsById[map.id] = map;
      window.__mapTracker.allSeen = Object.values(window.__mapTracker.mapsById);
      console.log('✅ Added current map to global tracker');
    }
  };

  // Enhanced search function with usage tracking
  const handleSearch = async (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      isLoading: true
    }));

    try {
      let results;
      
      if (query) {
        // Track search usage if user is authenticated and it's an actual search
        if (user && query.trim()) {
          await incrementSearchCount();
        }
        
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

  // Set up real-time subscription for favorites changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('user-favorites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_favorites',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Favorites changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newFavorite = payload.new as any;
            setState(prev => ({
              ...prev,
              favoriteMapIds: [...prev.favoriteMapIds, newFavorite.map_id]
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedFavorite = payload.old as any;
            setState(prev => ({
              ...prev,
              favoriteMapIds: prev.favoriteMapIds.filter(id => id !== deletedFavorite.map_id)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase]);

  return {
    // Your existing state
    ...state,
    
    // Your existing functions
    toggleFavorite,
    handleSearch,
    getRandomMap,
    setCurrentMap,
    
    // New database functions
    getDailyUsage,
    canPerformAction,
    getSubscriptionLimits,
    loadFavoritesFromDB,
    
    // Database functions (if you need direct access)
    addFavoriteToDB,
    removeFavoriteFromDB,
  };
};