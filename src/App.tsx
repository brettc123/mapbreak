import React, { useState, useEffect, useRef, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { Keyboard } from '@capacitor/keyboard'
import { StatusBar } from '@capacitor/status-bar'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
//import { BannerAdPosition } from '@capacitor-community/admob'
import { 
  Map, Search, Globe2, Heart, Settings, Share2, Shuffle, MapPin, 
  ChevronLeft, UserIcon, GlobeIcon, SunIcon, MoonIcon, StarIcon, QuestionMarkCircleIcon 
} from 'lucide-react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, MARKS } from '@contentful/rich-text-types'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import AccountDetails from './pages/AccountDetails'
import LanguageSettings from './pages/LanguageSettings'
import NotificationSettings from './pages/NotificationSettings'
import Legal from './pages/Legal'

import SplashScreen from './components/SplashScreen'
import SubscriptionButton from './components/SubscriptionButton'
import SettingsPage from './components/SettingsPage'
import PaywallModal from './components/PaywallModal'
import InteractiveMap from './components/InteractiveMap'
import SimpleMapTest from './components/SimpleMapTest'
import MapTestPage from './components/MapTestPage'
import MultiMapSection from './components/MultiMapSection'
import mapStyles from './components/mapStyles'
import TextWithEmbeddedMaps from './components/TextWithEmbeddedMaps'
import { PushNotifications } from '@capacitor/push-notifications'
import TestLogin from './pages/TestLogin'

import { useMapData } from './hooks/useMapData'
import { useSupabase } from './hooks/useSupabase'
import { useSubscription } from './hooks/useSubscription'
import { useAds } from './hooks/useAds'
import { usePushNotifications } from './hooks/usePushNotifications'
import { useTheme } from './contexts/ThemeContext'

import './index.css' // tailwind + safe‐area CSS

// — Rich‐text options with enhanced map syntax support —
const richTextOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      // Extract text from paragraph
      const extractText = (content: any[]): string => {
        return content.map(item => {
          if (typeof item === 'string') return item;
          if (item.value) return item.value;
          if (item.content) return extractText(item.content);
          return '';
        }).join('');
      };
      
      const textContent = extractText(node.content || []);
      
      console.log("🔍 Rich text paragraph content:", textContent); // DEBUG
      
      // If paragraph contains MAP syntax, use TextWithEmbeddedMaps
      if (textContent.includes('[MAP:')) {
        console.log("📝 Found MAP syntax in rich text, passing to TextWithEmbeddedMaps"); // DEBUG
        return <TextWithEmbeddedMaps content={textContent} />;
      }
      
      // Otherwise, normal paragraph
      return (
        <p className="mb-4 text-compass-700 dark:text-gray-300 font-sans">
          {children}
        </p>
      );
    },
    
    [BLOCKS.HEADING_1]: (node: any, children: any) => (
      <h1 className="text-3xl font-bold mb-4 text-compass-800 dark:text-white font-display">
        {children}
      </h1>
    ),
  },
  
  renderMark: {
    [MARKS.BOLD]: (text: any) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text: any) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: any) => <u>{text}</u>,
    [MARKS.CODE]: (text: any) => (
      <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm">
        {text}
      </code>
    ),
  },
};

// — Mobile header used on small screens —
function MobileHeader({ title }: { title: string }) {
  return (
    <div className="md:hidden fixed inset-x-0 top-0 pt-safe bg-white dark:bg-gray-800 shadow px-4 py-2 z-50">
      <h1 className="text-xl font-display font-bold text-compass-800 dark:text-white">
        {title}
      </h1>
    </div>
  )
}

// Mobile header with back button
function MobileHeaderWithBack({ title, onBack }: { title: string; onBack: () => void }) {
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

// — MapCard with properly clickable tags —
function MapCard({
  map,
  handleCoordinatesClick,
  handleShare,
  handleRandomMap,
  handleFavoriteClick,
  handleTagClick, // Tag click handler prop
  favoriteMapIds,
  isSubscribed,
  isScrolled,
  shareMessage,
}: any) {
  if (!map) return null;

  // Safely process tags
  let processedTags: string[] = [];
  
  if (map.tags) {
    if (Array.isArray(map.tags)) {
      processedTags = map.tags.flatMap((t: string) => 
        typeof t === 'string' ? t.split(',').map(s => s.trim()).filter(Boolean) : []
      );
    } else if (typeof map.tags === 'string') {
      processedTags = map.tags.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // DEBUG: Log map data
  console.log("MapCard - Full map data:", map);
  console.log("MapCard - mapSections:", map.mapSections);
  console.log("MapCard - coordinates:", map.coordinates);

  return (
    <div className="relative min-h-screen">
      {/* Always show the main image */}
      <div className="h-[85vh] sticky top-0">
        <img src={map.imageUrl} alt={map.name} className="w-full h-full object-cover" />
      </div>

      {/* Overlay card */}
      <div className="relative bg-white dark:bg-gray-800 z-10">
        <div className="max-w-7xl mx-auto transform space-y-3" style={{ "--tw-translate-y": "-13rem" }}>
          
          {/* Main card with title, coordinates, and buttons */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 mx-4 shadow-xl">
            <h2 className="text-3xl font-display font-bold text-compass-800 dark:text-white text-center pb-[1rem]">
              {map.name}
            </h2>
            <button
              onClick={() => handleCoordinatesClick(map.coordinates)}
              className="flex items-center justify-center text-compass-600 dark:text-gray-300 hover:text-terra transition-colors mx-auto"
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span className="font-mono text-sm">
                {`${Math.abs(map.coordinates.latitude).toFixed(4)}°${map.coordinates.latitude >= 0 ? 'N' : 'S'}, ${
                  Math.abs(map.coordinates.longitude).toFixed(4)
                }°${map.coordinates.longitude >= 0 ? 'E' : 'W'}`}
              </span>
            </button>
            <div className="flex gap-2 justify-center mt-4">
                <button 
    onClick={handleShare} 
    className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-blue-500 active:scale-95 transition-all duration-150"
  >
    <Share2 className="h-6 w-6 text-compass-800 dark:text-white active:text-white transition-colors duration-150" />
  </button>
  
  {/* Random Button */}
  <button 
    onClick={handleRandomMap} 
    className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-green-500 active:scale-95 transition-all duration-150"
  >
    <Shuffle className="h-6 w-6 text-compass-800 dark:text-white active:text-white transition-colors duration-150" />
  </button>
  
  {/* Favorite Button */}
  <button
  onClick={handleFavoriteClick}
  className={`p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-red-500 active:scale-95 transition-all duration-150 ${!isSubscribed ? 'opacity-100': ''}`}
>
  <Heart
    className={`h-6 w-6 transition-all duration-200 ${
      favoriteMapIds.includes(map.id)
        ? 'fill-red-500 text-red-500 scale-110' // Filled red + slightly bigger when favorited
        : 'text-compass-800 dark:text-white hover:text-red-400' // Empty heart, hover hint
    } active:text-white`}
  />
</button>
            </div>
            <p className="text-compass-700 dark:text-gray-300 text-lg text-center mt-4">
              {map.shortDescription}
            </p>
          </div>
          
          {/* Description content with interactive maps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="prose max-w-none dark:prose-invert px-4 py-6 md:px-6">
              
              {/* Main description */}
              <div className="text-compass-700 dark:text-gray-300 mb-6 font-sans">
                {(() => {
                  try {
                    console.log("=== DESCRIPTION DEBUG ===");
                    console.log("map.description:", map.description);
                    console.log("typeof map.description:", typeof map.description);
                    console.log("========================");
                    
                    if (map.description && typeof map.description === 'object') {
                      console.log("Using documentToReactComponents for Contentful rich text");
                      return documentToReactComponents(map.description, richTextOptions);
                    } else if (map.description && typeof map.description === 'string') {
                      console.log("Using TextWithEmbeddedMaps for string content");
                      return <TextWithEmbeddedMaps content={map.description} />;
                    } else {
                      console.log("No description available");
                      return (
                        <div className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                          No description available
                        </div>
                      );
                    }
                  } catch (error) {
                    console.error("Error rendering description:", error);
                    return (
                      <div className="text-red-500 dark:text-red-400 text-center py-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        Error loading description: {error.message}
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Interactive maps section */}
              {map.mapSections && map.mapSections.length > 0 && (
                <div className="mt-8">
                  <MultiMapSection mapSections={map.mapSections} />
                </div>
              )}
              
              {/* Tags section */}
              <div className="flex flex-wrap gap-2 mt-6">
                {processedTags.map((tag, i) => (
                  <button 
                    key={`${tag}-${i}`} 
                    type="button"
                    className="px-3 py-1 bg-terrain-100 text-terrain-800 rounded-full text-sm hover:bg-terrain-200 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (handleTagClick) handleTagClick(tag);
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action buttons when scrolled */}
      {isScrolled && (
  <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50 max-w-[60px]">
    {/* Floating Share Button */}
    <button 
      onClick={handleShare} 
      className="p-3 bg-compass-100 dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl active:bg-blue-500 active:scale-95 transition-all duration-150"
    >
      <Share2 className="h-6 w-6 text-compass-700 dark:text-white active:text-white transition-colors duration-150" />
    </button>
    
    {/* Floating Random Button */}
    <button 
      onClick={handleRandomMap} 
      className="p-3 bg-compass-100 dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl active:bg-green-500 active:scale-95 transition-all duration-150"
    >
      <Shuffle className="h-6 w-6 text-compass-700 dark:text-white active:text-white transition-colors duration-150" />
    </button>
    
    {/* Floating Favorite Button */}
    <button 
  onClick={handleFavoriteClick} 
  className="p-3 bg-compass-100 dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl active:bg-red-500 active:scale-95 transition-all duration-150"
>
  <Heart 
    className={`h-6 w-6 transition-all duration-200 ${
      favoriteMapIds.includes(map.id) 
        ? 'fill-red-500 text-red-500 scale-110' // Filled red + slightly bigger when favorited
        : 'text-compass-700 dark:text-white hover:text-red-400' // Empty heart, hover hint
    } active:text-white`} 
  />
</button>
        </div>
      )}

      {/* Share message notification */}
      {shareMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-compass-800 text-white px-4 py-2 rounded-full z-50">
          {shareMessage}
        </div>
      )}
    </div>
  );
}

// — Search screen —
function SearchScreen({ searchQuery, handleSearch, searchResults, archiveMaps, onCardClick, onTagClick, isLoading }: any) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Force scroll to top on mount and when tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, []);
  
  // The maps to display
  const mapsToDisplay = searchResults || archiveMaps;
  
  // Handle tag click without event propagation
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation(); // Prevent the click from triggering the parent card's onClick
    onTagClick(tag);
  };
  
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Fixed header */}
      <MobileHeader title="Search" />
      
      {/* Fixed search bar - positioned right below the header */}
      <div className="fixed top-[calc(env(safe-area-inset-top)+2rem)] left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b shadow-sm">
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
      
      {/* Scrollable content - starts below search bar */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top)+7.5rem)] pb-20"
      >
        <div className="px-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-compass-700"></div>
            </div>
          ) : (
            <>
              {/* Results title */}
              {(searchQuery || mapsToDisplay.length > 0) && (
                <div className="pb-3">
                  <h2 className="text-xl font-display font-bold text-compass-800 dark:text-white">
                    {searchQuery 
                      ? `${searchResults?.length || 0} results for "${searchQuery}"`
                      : 'Recent maps'
                    }
                  </h2>
                </div>
              )}
              
              {/* Map grid */}
              <div className="grid gap-6 md:grid-cols-2 pb-16">
                {mapsToDisplay.length > 0 ? (
                  mapsToDisplay.map((map: any) => (
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
                        
                        {/* Display tags - NOW CLICKABLE */}
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
                                className="px-2 py-1 bg-terrain-100 text-terrain-800 rounded-full text-xs hover:bg-terrain-200 transition-colors"
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
    </div>
  );
}

// — Explore screen —
function ExploreScreen({
  archiveMaps,
  currentMap,
  imageTags,
  onTagClick,
}: {
  archiveMaps: any[];
  currentMap: any;
  imageTags: any[];
  onTagClick: (tag: string) => void;
}) {
  // Reset scroll position on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Extract all unique tags from maps
  const getAllTags = () => {
    const tagSet = new Set<string>();
    
    // Helper function to process tags from a map
    const processTags = (map: any) => {
      if (!map) return;
      
      if (Array.isArray(map.tags)) {
        map.tags.forEach((tag: any) => {
          if (typeof tag === 'string') {
            tag.split(',').forEach((t: string) => {
              const trimmed = t.trim();
              if (trimmed) tagSet.add(trimmed);
            });
          }
        });
      } else if (typeof map.tags === 'string') {
        map.tags.split(',').forEach((t: string) => {
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
  
  // Check if we actually have tags to display
  if (tags.length === 0) {
    return (
      <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-0 px-4 pb-32 bg-white dark:bg-gray-900 min-h-screen">
        <MobileHeader title="Explore" />
        <div className="flex justify-center items-center h-60">
          <p className="text-compass-600 dark:text-gray-400 text-center">
            No tags found. Add tags to your maps to see them here.
          </p>
        </div>
      </div>
    );
  }
  
  return (
   <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-0 px-4 pb-32 bg-white dark:bg-gray-900 min-h-screen">
      <MobileHeader title="Explore" />
      
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
    </div>
  );
}

// — TagPage component —
function TagPage({ 
  tag,
  maps,
  onSelectMap,
  onBack
}: {
  tag: string;
  maps: any[];
  onSelectMap: (map: any) => void;
  onBack: () => void;
}) {
  // Reset scroll position on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      {/* Mobile header with back button */}
      <MobileHeaderWithBack title={tag} onBack={onBack} />
      
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
      
      {/* Content area */}
      <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-16 px-4 pb-32 bg-white dark:bg-gray-900 min-h-screen">
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
      </div>
    </>
  );
}

// Add this right after your TagPage component function in App.tsx
function PushPermissionDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    const checkEverything = async () => {
      try {
        const isNative = window.Capacitor?.isNative;
        
        if (!isNative) {
          setDebugInfo({ error: 'Not running on native platform' });
          return;
        }

        // Check actual Capacitor permission status
        const permission = await PushNotifications.checkPermissions();
        
        setDebugInfo({
          isNative,
          capacitorPermission: permission,
          receiveStatus: permission.receive,
          platform: window.Capacitor?.getPlatform(),
        });
        
        console.log('=== FULL PERMISSION DEBUG ===');
        console.log('Is Native:', isNative);
        console.log('Capacitor Permission Object:', permission);
        console.log('Receive Status:', permission.receive);
        console.log('Platform:', window.Capacitor?.getPlatform());
        console.log('============================');
        
      } catch (error) {
        console.error('Error checking permissions:', error);
        setDebugInfo({ error: error.message });
      }
    };
    
    checkEverything();
  }, []);
  
  const testPermissionRequest = async () => {
    try {
      console.log('Testing permission request...');
      const result = await PushNotifications.requestPermissions();
      console.log('Permission request result:', result);
      setDebugInfo(prev => ({ ...prev, requestResult: result }));
    } catch (error) {
      console.error('Permission request error:', error);
      setDebugInfo(prev => ({ ...prev, requestError: error.message }));
    }
  };
  
  //if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-60 overflow-y-auto">
      <h4 className="font-bold mb-2 text-yellow-300">Permission Debug</h4>
      <div className="space-y-1">
        <div><strong>Native:</strong> {debugInfo.isNative ? 'Yes' : 'No'}</div>
        <div><strong>Platform:</strong> {debugInfo.platform}</div>
        <div><strong>Receive Status:</strong> {debugInfo.receiveStatus}</div>
        {debugInfo.capacitorPermission && (
          <div className="mt-2">
            <strong>Full Permission Object:</strong>
            <pre className="text-xs mt-1 bg-gray-800 p-2 rounded">
              {JSON.stringify(debugInfo.capacitorPermission, null, 2)}
            </pre>
          </div>
        )}
        {debugInfo.requestResult && (
          <div className="mt-2">
            <strong>Last Request Result:</strong>
            <pre className="text-xs mt-1 bg-gray-800 p-2 rounded">
              {JSON.stringify(debugInfo.requestResult, null, 2)}
            </pre>
          </div>
        )}
        {debugInfo.error && (
          <div className="text-red-300"><strong>Error:</strong> {debugInfo.error}</div>
        )}
        {debugInfo.requestError && (
          <div className="text-red-300"><strong>Request Error:</strong> {debugInfo.requestError}</div>
        )}
      </div>
      <button 
        onClick={testPermissionRequest}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Test Permission Request
      </button>
    </div>
  );
}

// — Favorites screen —
function FavoritesScreen({ favorites, archiveMaps, onSelect, onTagClick }: any) {
  console.log('🔍 FavoritesScreen rendering with:', {
    favorites,
    favoritesLength: favorites?.length,
    archiveMapsLength: archiveMaps?.length
  });

  // Helper function to find a map by ID from multiple sources
  const findMapById = (id: string) => {
    console.log(`🔍 Looking for map with ID: ${id}`);
    
    // 1. Check archiveMaps first
    if (Array.isArray(archiveMaps)) {
      const foundInArchive = archiveMaps.find((x: any) => x?.id === id);
      if (foundInArchive) {
        console.log(`✅ Found map "${foundInArchive.name}" in archiveMaps`);
        return foundInArchive;
      }
    }
    
    // 2. Check global tracker
    if (window.__mapTracker?.mapsById?.[id]) {
      const foundInTracker = window.__mapTracker.mapsById[id];
      console.log(`✅ Found map "${foundInTracker.name}" in global tracker`);
      return foundInTracker;
    }
    
    // 3. Check if it might be the current map (passed via window or context)
    if (window.__currentMap?.id === id) {
      console.log(`✅ Found map "${window.__currentMap.name}" as current map`);
      return window.__currentMap;
    }
    
    console.log(`❌ Map with ID ${id} not found anywhere`);
    return null;
  };

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-0 px-4 pb-32 min-h-screen bg-white dark:bg-gray-900">
      
      {favorites && favorites.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {favorites.map((id: string) => {
            const m = findMapById(id);
            
            if (!m) {
              return (
                <div key={id} className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 p-4 rounded">
                  <p className="text-red-800 dark:text-red-400 text-sm">
                    ❌ Map with ID "{id}" not found
                  </p>
                  <p className="text-red-600 dark:text-red-500 text-xs mt-1">
                    Check console for debugging info
                  </p>
                </div>
              );
            }
            
            // Process tags for each map
            let mapTags: string[] = [];
            if (m.tags) {
              if (Array.isArray(m.tags)) {
                mapTags = m.tags.flatMap((t: string) => 
                  typeof t === 'string' ? t.split(',').map(s => s.trim()).filter(Boolean) : []
                );
              } else if (typeof m.tags === 'string') {
                mapTags = m.tags.split(',').map(s => s.trim()).filter(Boolean);
              }
            }
            
            return (
              <div 
                key={id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow border-2 border-green-200 dark:border-green-700"
                onClick={() => onSelect(m)}
              >
                <img 
                  src={m.imageUrl} 
                  alt={m.name} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    <h3 className="font-display font-semibold text-compass-800 dark:text-white">
                      {m.name}
                    </h3>
                  </div>
                  {m.shortDescription && (
                    <p className="text-sm text-compass-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {m.shortDescription}
                    </p>
                  )}
                  
                  {/* Add clickable tags with dark theme support */}
                  {mapTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {mapTags.map((tag, i) => (
                        <button
                          key={`${tag}-${i}`}
                          type="button"
                          className="px-2 py-1 bg-terrain-100 dark:bg-terrain-800 text-terrain-800 dark:text-terrain-200 rounded-full text-xs hover:bg-terrain-200 dark:hover:bg-terrain-700 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onTagClick(tag);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 min-h-[50vh] flex items-center justify-center">
          <div>
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              You haven't favorited any maps yet!
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Heart a map to add it to your favorites!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// — Settings screen —
function SettingsScreen() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-0 px-4 pb-32 bg-white dark:bg-gray-900 min-h-screen">
      <SettingsPage />
    </div>
  )
}

// — Home: stitches it all together —
function Home() {
  const isWebVersion = !window.Capacitor?.isNative;
  const isMobileApp = window.Capacitor?.isNative;

  const {
    currentMap,
    archiveMaps,
    favoriteMapIds,
    searchQuery,
    imageTags,
    toggleFavorite,
    handleSearch,
    getRandomMap,
    setCurrentMap,
    searchResults,
    isLoading,
  } = useMapData()

    useEffect(() => {
    console.log('🔍 Platform Detection:', {
      isWebVersion,
      isMobileApp,
      capacitorAvailable: !!window.Capacitor,
      userAgent: navigator.userAgent
    });
  }, []);

  const { user } = useSupabase()
  const { subscription } = useSubscription()
  const { darkMode } = useTheme()
  //const { showBanner, showInterstitial } = useAds()
  
  // INTEGRATION: Add push notifications hook
  const { 
    token, 
    notifications, 
    permissionStatus, 
    registerNotifications 
  } = usePushNotifications()
  
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'maps'|'search'|'explore'|'favorites'|'settings'|'tag'>('maps')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [currentTag, setCurrentTag] = useState<string>('')
  const [previousTab, setPreviousTab] = useState<'maps'|'search'|'explore'|'favorites'|'settings'>('maps')
  const [previousMap, setPreviousMap] = useState<any>(null)
  // Add this state to track navigation source
  const [navigationSource, setNavigationSource] = useState<'tab-click' | 'map-selection' | null>(null);
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Push notification debug info:', {
      token: token ? token.substring(0, 20) + '...' : 'None',
      permissionStatus,
      notificationCount: notifications.length,
      isNative: window.Capacitor?.isNative,
      userId: user?.id
    });
  }
}, [token, permissionStatus, notifications, user]);
  // INTEGRATION: Initialize push notifications on app start
  useEffect(() => {
    const initializePushNotifications = async () => {
      console.log('Initializing push notifications...');
      try {
        await registerNotifications();
        console.log('Push notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    // Only initialize on native platforms
    if (window.Capacitor?.isNative) {
      initializePushNotifications();
    }
  }, [registerNotifications]);

  // INTEGRATION: Handle notification clicks - navigate to specific map if provided
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      console.log('Received push notification:', latestNotification);
      
      // Handle notification tap - navigate to specific map if provided
      if (latestNotification.data?.map_id) {
        const mapId = latestNotification.data.map_id;
        console.log('Notification contains map ID:', mapId);
        
        // Find the map in our available maps
        let targetMap = null;
        
        if (window.__mapTracker?.mapsById?.[mapId]) {
          targetMap = window.__mapTracker.mapsById[mapId];
        } else if (Array.isArray(archiveMaps)) {
          targetMap = archiveMaps.find(m => m?.id === mapId);
        }
        
        if (targetMap) {
          console.log('Found target map from notification, navigating...');
          setCurrentMap(targetMap);
          setNavigationSource('map-selection');
          setActiveTab('maps');
        }
      } else {
        // No specific map, just go to maps tab
        console.log('No specific map in notification, going to maps tab');
        setNavigationSource('tab-click');
        setActiveTab('maps');
      }
    }
  }, [notifications, archiveMaps, setCurrentMap]);

  // INTEGRATION: Debug logging for push notifications
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Push notification status:', {
        token: token ? token.substring(0, 20) + '...' : 'None',
        permissionStatus,
        notificationCount: notifications.length,
        isNative: window.Capacitor?.isNative
      });
    }
  }, [token, permissionStatus, notifications]);

  // A utility function to get formatted date strings for debugging
  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toISOString();
    } catch (e) {
      return "Error formatting date";
    }
  };

  // Add this near the start of your Home component
useEffect(() => {
  // This effect runs once on component mount to set the initial map
  const setInitialMap = async () => {
    console.log("Setting initial map on app load...");
    
    // Wait a brief moment for archiveMaps to be loaded
    if (!archiveMaps || archiveMaps.length === 0) {
      console.log("Waiting for maps to load...");
      // You might want to show a loading indicator here
      return;
    }
    
    // Use the newestMapId (which should be calculated by now)
    const todaysMapId = window.__newestMapId;
    
    if (!todaysMapId) {
      console.log("No newest map ID found yet");
      return;
    }
    
    // Find today's map
    let todaysMap = null;
    
    // First check window.__mapTracker as it contains all maps
    if (window.__mapTracker?.mapsById && window.__mapTracker.mapsById[todaysMapId]) {
      todaysMap = window.__mapTracker.mapsById[todaysMapId];
    }
    
    // If not found, check archiveMaps
    if (!todaysMap && Array.isArray(archiveMaps)) {
      todaysMap = archiveMaps.find(m => m?.id === todaysMapId);
    }
    
    // If we found Today's map, set it as current
    if (todaysMap && (!currentMap || currentMap.id !== todaysMap.id)) {
      console.log("Setting initial map to today's map:", todaysMap.name);
      setCurrentMap(todaysMap);
    }
  };
  
  setInitialMap();
  
  // Set activeTab to 'maps' to ensure we're on the maps tab
  if (activeTab !== 'maps') {
    setActiveTab('maps');
  }
}, [archiveMaps]); // Only depends on archiveMaps to avoid unnecessary re-renders

  // CRITICAL FIX: Always keep the current map accessible globally for favorites
  useEffect(() => {
    // Always keep the current map accessible globally
    if (currentMap) {
      // Store in global tracker
      if (!window.__mapTracker) {
        window.__mapTracker = { mapsById: {}, allSeen: [] };
      }
      
      window.__mapTracker.mapsById[currentMap.id] = currentMap;
      window.__currentMap = currentMap; // Also store as current map reference
      
      console.log(`🔄 Current map "${currentMap.name}" (${currentMap.id}) now available globally`);
      console.log(`📊 Total maps in tracker: ${Object.keys(window.__mapTracker.mapsById).length}`);
    }
  }, [currentMap]);
  
  // CRITICAL FIX: Add this useEffect at the Home component level
  // to ensure we always have access to the complete data
  useEffect(() => {
    // Create a global tracker for maps
    if (!window.__mapTracker) {
      window.__mapTracker = {
        mapsById: {},
        allSeen: []
      };
    }
    
    // Always register the current map
    if (currentMap?.id) {
      window.__mapTracker.mapsById[currentMap.id] = currentMap;
      window.__currentMap = currentMap; // Store current map reference
      console.log(`✅ Registered current map: ${currentMap.name} (${currentMap.id})`);
    }
    
    // Register all archive maps
    if (Array.isArray(archiveMaps)) {
      archiveMaps.forEach(map => {
        if (map?.id) {
          window.__mapTracker.mapsById[map.id] = map;
        }
      });
      console.log(`✅ Registered ${archiveMaps.length} archive maps`);
    }
    
    // Update the all seen array
    window.__mapTracker.allSeen = Object.values(window.__mapTracker.mapsById);
    
    console.log(`📊 Map tracker now has ${window.__mapTracker.allSeen.length} total maps`);
    console.log('📊 Available map IDs:', Object.keys(window.__mapTracker.mapsById));
  }, [currentMap, archiveMaps]);

  // Replace the useMemo hook with this enhanced version
  const newestMapId = useMemo(() => {
    console.log("=== CALCULATING NEWEST MAP ID (FINAL VERSION) ===");
    
    // Get all maps from ALL possible sources
    let allMaps = [];
    
    // 1. Include current map
    if (currentMap && currentMap.id) {
      console.log(`Including current map: ${currentMap.id} (${currentMap.name || 'Unknown'}) - publishedAt: ${formatDateForDisplay(currentMap.publishedAt)}`);
      allMaps.push(currentMap);
    }
    
    // 2. Include all archive maps
    if (Array.isArray(archiveMaps)) {
      archiveMaps.forEach(map => {
        if (map && map.id && !allMaps.some(m => m.id === map.id)) {
          console.log(`Including archive map: ${map.id} (${map.name || 'Unknown'}) - publishedAt: ${formatDateForDisplay(map.publishedAt)}`);
          allMaps.push(map);
        }
      });
    }
    
    // 3. Include ALL maps from our global tracker
    if (window.__mapTracker?.allSeen) {
      window.__mapTracker.allSeen.forEach(map => {
        if (map && map.id && !allMaps.some(m => m.id === map.id)) {
          console.log(`Including tracked map: ${map.id} (${map.name || 'Unknown'}) - publishedAt: ${formatDateForDisplay(map.publishedAt)}`);
          allMaps.push(map);
        }
      });
    }
    
    console.log(`Total maps gathered for analysis: ${allMaps.length}`);
    
    // Now process and sort all maps by date
    const mapsWithDates = [];
    
    allMaps.forEach(map => {
      if (!map.publishedAt) {
        console.log(`Map ${map.id} has no publishedAt date`);
        return;
      }
      
      try {
        const date = new Date(map.publishedAt);
        if (isNaN(date.getTime())) {
          console.log(`Invalid date for map ${map.id}: ${map.publishedAt}`);
          return;
        }
        
        mapsWithDates.push({
          id: map.id,
          name: map.name || 'Unknown',
          date: date,
          timestamp: date.getTime(),
          publishedAt: map.publishedAt
        });
      } catch (e) {
        console.log(`Error processing date for map ${map.id}:`, e);
      }
    });
    
    console.log(`Found ${mapsWithDates.length} maps with valid dates`);
    
    // Sort by date (newest first)
    if (mapsWithDates.length > 0) {
      mapsWithDates.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log("Maps sorted by date (newest first):");
      mapsWithDates.forEach((map, index) => {
        console.log(`  ${index + 1}. ${map.name} (${map.id}): ${formatDateForDisplay(map.publishedAt)}`);
      });
      
      // Get the newest map ID
      const newest = mapsWithDates[0].id;
      console.log(`Determined newest map ID: ${newest}`);
      
      // CRITICAL: Store for debugging
      window.__newestMapId = newest;
      
      return newest;
    }
    
    console.log("No maps with valid dates found");
    return null;
  }, [currentMap?.id, ...(Array.isArray(archiveMaps) ? archiveMaps.map(m => m?.id) : []), activeTab]);

  // FEATURE: Always show Today's map when clicking Maps tab - with navigation source awareness
  useEffect(() => {
    // Only run this when activeTab changes to 'maps' AND navigation was from tab click
    if (activeTab === 'maps' && navigationSource === 'tab-click') {
      console.log("Maps tab was clicked directly, showing Today's map...");
      
      // Get the newest map ID using our existing mechanism
      const todaysMapId = window.__newestMapId;
      
      // Only change if the current map isn't already Today's map
      if (todaysMapId && currentMap?.id !== todaysMapId) {
        console.log(`Current map (${currentMap?.id}) is not Today's map (${todaysMapId}), switching...`);
        
        // Find the newest map in our available maps
        let todaysMap = null;
        
        // First check window.__mapTracker as it contains all maps
        if (window.__mapTracker?.mapsById && window.__mapTracker.mapsById[todaysMapId]) {
          todaysMap = window.__mapTracker.mapsById[todaysMapId];
        }
        
        // If not found, check archiveMaps
        if (!todaysMap && Array.isArray(archiveMaps)) {
          todaysMap = archiveMaps.find(m => m?.id === todaysMapId);
        }
        
        // If we found Today's map, set it as current
        if (todaysMap) {
          console.log("Found Today's map, setting as current map");
          setCurrentMap(todaysMap);
        } else {
          console.log(`Could not find Today's map with ID: ${todaysMapId}`);
        }
      }
      
      // Reset navigation source after handling
      setNavigationSource(null);
    } 
    else if (activeTab === 'maps' && navigationSource === 'map-selection') {
      // If navigation was from map selection, just keep the selected map
      console.log("Maps tab opened from map selection, keeping selected map");
      
      // Reset navigation source after handling
      setNavigationSource(null);
    }
  }, [activeTab, navigationSource]);

  const isSubscribed = subscription?.subscription_status === 'active'

  //useEffect(() => {
  //  try {
  //    showBanner(BannerAdPosition.BOTTOM_CENTER, 60)
  //  } catch (error) {
  //    console.warn('Failed to show banner ad:', error)
  //  }
  //}, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeTab])

useEffect(() => {
  let scrollTimeout;
  let isScrolling = false;
  
  const onScroll = () => {
    // PERFORMANCE: Only update state if the scroll threshold actually changes
    const shouldBeScrolled = window.scrollY > 300;
    
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
    
    // PERFORMANCE: Throttle scroll events to reduce animation interference
    if (!isScrolling) {
      isScrolling = true;
      
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Mark scrolling as finished after a brief delay
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150); // 150ms delay to group scroll events
    }
  };
  
  // PERFORMANCE: Use passive listener for better scroll performance
  window.addEventListener('scroll', onScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', onScroll);
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  };
}, [isScrolled]);

  const showShare = (msg: string) => {
    setShareMessage(msg)
    setTimeout(() => setShareMessage(''), 3000)
  }
  
 // Enhanced doShare function with better feedback
const doShare = async () => {
  console.log('📤 Share button clicked!')
  
  // IMMEDIATE FEEDBACK: Show user something is happening
  showShare('Sharing...')
  
  // HAPTIC FEEDBACK: Light vibration (mobile only)
  try {
    if (window.Capacitor?.isNative) {
      await Haptics.impact({ style: ImpactStyle.Light })
    }
  } catch (e) {
    console.log('Haptics not available')
  }
  
  try {
    if (!currentMap) {
      console.error('❌ No current map to share')
      showShare('No map to share')
      return
    }

    // Add a small delay to show the "Sharing..." message
    await new Promise(resolve => setTimeout(resolve, 300))

    let shareUrl = null;
    
    if (isWebVersion) {
      shareUrl = `${window.location.origin}/map/${currentMap.id}`;
    } else {
      shareUrl = `https://map-break-kjrrhr4o0-bretts-projects-d2e84c79.vercel.app/map/${currentMap.id}`;
    }

    const shareData = {
      title: `${currentMap.name} - MAPBREAK`,
      text: `${currentMap.shortDescription || 'Check out this fascinating map'}\n\nExplore "${currentMap.name}" on MAPBREAK:`,
      url: shareUrl
    };

    console.log('Share data:', shareData);

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      showShare('✅ Shared successfully!');
      
      // SUCCESS HAPTIC
      try {
        if (window.Capacitor?.isNative) {
          await Haptics.impact({ style: ImpactStyle.Medium })
        }
      } catch (e) {}
      
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      const textToShare = `${currentMap.shortDescription}\n\n"${currentMap.name}" on MAPBREAK\n${shareUrl}`;
      await navigator.clipboard.writeText(textToShare);
      showShare('✅ Link copied to clipboard!');
      
      // SUCCESS HAPTIC
      try {
        if (window.Capacitor?.isNative) {
          await Haptics.impact({ style: ImpactStyle.Medium })
        }
      } catch (e) {}
    } else {
      showShare('❌ Share not available');
    }
  } catch (error) {
    console.error('❌ Share failed:', error);
    showShare('❌ Share failed - try again');
    
    // ERROR HAPTIC
    try {
      if (window.Capacitor?.isNative) {
        await Haptics.impact({ style: ImpactStyle.Heavy })
      }
    } catch (e) {}
  }
};
  
onst doFavorite = () => {
  console.log('❤️ Heart button clicked!');
  console.log('Current map:', currentMap?.name, 'ID:', currentMap?.id);
  console.log('Current favoriteMapIds:', favoriteMapIds);
  console.log('User:', !!user);
  console.log('Subscribed:', isSubscribed);
  
  if (!currentMap) {
    console.log('❌ No current map to favorite');
    showShare('No map to favorite');
    return;
  }
  
  // PROPER AUTH ENFORCEMENT - NO BYPASSING
  if (!user) {
    console.log('❌ User not authenticated, redirecting to login');
    showShare('Please sign in to favorite maps');
    setTimeout(() => navigate('/login'), 1500);
    return;
  }
  
  if (!isSubscribed) {
    console.log('❌ User not subscribed, showing paywall');
    showShare('Subscription required for favorites');
    setTimeout(() => setShowPaywall(true), 1500);
    return;
  }
  
  console.log('✅ Processing favorite for map:', currentMap.id);
  
  // Add haptic feedback
  try {
    if (window.Capacitor?.isNative) {
      Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch (e) {
    console.log('Haptics not available');
  }
  
  // Check current state before toggle
  const wasAlreadyFavorited = favoriteMapIds.includes(currentMap.id);
  console.log('Was already favorited:', wasAlreadyFavorited);
  
  // CRITICAL: Make sure current map is available to favorites screen
  if (window.__mapTracker && currentMap) {
    window.__mapTracker.mapsById[currentMap.id] = currentMap;
    window.__mapTracker.allSeen = Object.values(window.__mapTracker.mapsById);
    console.log('✅ Added current map to global tracker');
  }
  
  // Call the toggle function
  console.log('Calling toggleFavorite...');
  toggleFavorite(currentMap.id);
  
  // Show feedback based on what action we just performed
  if (wasAlreadyFavorited) {
    showShare('💔 Removed from favorites');
    console.log('💔 Removed from favorites');
  } else {
    showShare('❤️ Added to favorites!');
    console.log('❤️ Added to favorites!');
  }
  
  // Debug the state after toggle (with a small delay to see the update)
  setTimeout(() => {
    console.log('Updated favoriteMapIds after toggle:', favoriteMapIds);
  }, 100);
};
  
  // UPDATED: Add navigation source tracking
  const onSearchSelect = (m: any) => {
    setPreviousMap(currentMap);
    setCurrentMap(m);
    setNavigationSource('map-selection'); // Set navigation source before changing tab
    setActiveTab('maps');
// SCROLL TO TOP when selecting from search
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Updated to handle tag clicks properly
  const onTagClick = (tag: string) => {
    // Save current state for back button
    setPreviousTab(activeTab);
    setPreviousMap(currentMap);
    
    // Set the current tag
    setCurrentTag(tag);
    
    // Switch to tag page
    setActiveTab('tag');
  };
  
  // Handle back button from tag page
  const handleBackFromTag = () => {
    // Restore previous state
    setActiveTab(previousTab);
    if (previousMap && previousTab === 'maps') {
      setCurrentMap(previousMap);
    }
  };

  // Get maps filtered by the current tag
  const getMapsByTag = (tag: string) => {
    return [...(archiveMaps || []), currentMap].filter(map => {
      if (!map) return false;
      
      let mapTags: string[] = [];
      
      if (Array.isArray(map.tags)) {
        mapTags = map.tags.flatMap(t => 
          typeof t === 'string' ? t.split(',').map(s => s.trim()) : []
        );
      } else if (typeof map.tags === 'string') {
        mapTags = map.tags.split(',').map(s => s.trim());
      }
      
      return mapTags.some(t => t.toLowerCase() === tag.toLowerCase());
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'maps':
        if (!currentMap) return null;
        
        console.log("=== MAP HEADER DETERMINATION ===");
        console.log(`Current map: ${currentMap.id} (${currentMap.name || 'Unknown'}) - date: ${formatDateForDisplay(currentMap.publishedAt)}`);
        console.log(`Newest map ID: ${newestMapId}`);
        
        // Simple check - is current map the newest?
        const isLatestMap = currentMap.id === newestMapId;
        console.log(`Is current map the newest: ${isLatestMap}`);
        
        // Format date for display
        let formattedDate = '';
        if (currentMap.publishedAt) {
          try {
            const date = new Date(currentMap.publishedAt);
            if (!isNaN(date.getTime())) {
              formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            }
          } catch (e) {
            console.error('Error formatting date:', e);
          }
        }
        
        // Set header text
        const mapHeaderText = isLatestMap 
          ? "Today's map" 
          : (formattedDate || "Map");
        
        console.log(`Final header text: ${mapHeaderText}`);
        console.log("=== END HEADER DETERMINATION ===");
        
        return (
          <>
            <MobileHeader title={mapHeaderText} />
            <div className="hidden md:flex bg-white dark:bg-gray-800 border-b px-6 py-4 z-10">
              <h2 className="text-2xl font-display font-bold text-compass-800 dark:text-white">
                {mapHeaderText}
              </h2>
            </div>
            <MapCard
              map={currentMap}
              handleCoordinatesClick={() => window.open(`https://www.google.com/maps?q=${currentMap.coordinates.latitude},${currentMap.coordinates.longitude}`,'_blank')}
              handleShare={doShare}
              handleRandomMap={doRandom}
              handleFavoriteClick={doFavorite}
              handleTagClick={onTagClick}
              favoriteMapIds={favoriteMapIds}
              isSubscribed={isSubscribed}
              isScrolled={isScrolled}
              shareMessage={shareMessage}
            />
          </>
        )
      case 'search':
        return (
          <SearchScreen
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            searchResults={searchResults}
            archiveMaps={archiveMaps}
            onCardClick={onSearchSelect}
            onTagClick={onTagClick}
            isLoading={isLoading}
          />
        )
      case 'explore':
        return (
          <ExploreScreen
            archiveMaps={archiveMaps || []}
            currentMap={currentMap}
            imageTags={imageTags || []}
            onTagClick={onTagClick}
          />
        )
      case 'favorites':
  console.log('🔍 FAVORITES TAB - Starting render');
  console.log('🔍 Props for FavoritesScreen:', {
    favoriteMapIds,
    archiveMaps: archiveMaps?.length,
    user: !!user,
    isSubscribed
  });
  
  return (
    <>
      <MobileHeader title="Favorites" />
      <div className="hidden md:flex items-center px-4 py-3 border-b bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-display font-bold text-compass-800 dark:text-white">
          Favorites
        </h2>
      </div>
      
      {/* AUTH & SUBSCRIPTION CHECK */}
      {!user ? (
        <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-0 px-4 pb-32 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <UserIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Sign In Required</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Please sign in to access your favorite maps.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-terra text-white rounded-lg font-semibold hover:bg-terra/90 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      ) : !isSubscribed ? (
        <div className="pt-[calc(env(safe-area-inset-top)+3rem)] md:pt-0 px-4 pb-32 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <StarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Premium Required</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Upgrade to Premium to save and access your favorite maps.
            </p>
            <button
              onClick={() => setShowPaywall(true)}
              className="px-6 py-3 bg-terra text-white rounded-lg font-semibold hover:bg-terra/90 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      ) : (
        <FavoritesScreen
          favorites={favoriteMapIds}
          archiveMaps={archiveMaps}
          onSelect={(m: any) => { 
            console.log('🔍 Favorite selected:', m.name);
            setCurrentMap(m); 
            setNavigationSource('map-selection');
            setActiveTab('maps');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTagClick={onTagClick}
        />
      )}
    </>
  )
      case 'settings':
        return (
          <>
            <MobileHeader title="Settings" />
            <div className="hidden md:flex items-center px-4 py-3 border-b bg-white dark:bg-gray-800">
              <h2 className="text-2xl font-display font-bold text-compass-800 dark:text-white">
                Settings
              </h2>
            </div>
            <SettingsScreen />
          </>
        )
      case 'tag':
        // New case for tag page
        const taggedMaps = getMapsByTag(currentTag);
        return (
          <TagPage
            tag={currentTag}
            maps={taggedMaps}
            onSelectMap={(map) => {
              setCurrentMap(map);
              setNavigationSource('map-selection'); // Add this line
              setActiveTab('maps');
              // SCROLL TO TOP when selecting from tag page
  window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={handleBackFromTag}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-safe">
        {/* Add the debug component here */}
   
      {/* desktop header - hide on tag page */}
      {activeTab !== 'tag' && (
        <header className="hidden md:flex fixed top-0 inset-x-0 bg-white dark:bg-gray-800 shadow px-6 py-6 z-50">
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              <Globe2 className="h-6 w-6 text-compass-600 dark:text-white" />
              <h1 className="text-3xl font-display font-bold">MAPBREAK</h1>
            </div>
            <SubscriptionButton />
          </div>
        </header>
      )}

      <main className="w-full pt-0 md:pt-0">
        {renderTab()}
      </main>

      {/* ad placeholder - hide on tag page */}
      {/*activeTab !== 'tag' && (
        <div className="fixed bottom-[64px] inset-x-0 h-[50px] bg-white dark:bg-gray-800 border-t z-40" />
      )*/}

      {/* bottom nav - hide on tag page */}
      {activeTab !== 'tag' && (
        <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t z-50 pt-3 pb-safe shadow-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-5">
            {(['maps', 'search', 'explore', 'favorites', 'settings'] as const).map((tab, i) => {
              const Icon = [Map, Search, Globe2, Heart, Settings][i]
              return (
                <button
                  key={tab}
                  onClick={() => {
                    // Reset scroll position before changing tab
                    window.scrollTo(0, 0);
                    
                    // If clicking the Maps tab, set navigation source to 'tab-click'
                    if (tab === 'maps') {
                      setNavigationSource('tab-click');
                    } else {
                      setNavigationSource(null);
                    }
                    
                    // Switch to the new tab
                    setActiveTab(tab);
                  }}
                  className={`flex flex-col items-center py-1 w-full ${
                    tab === activeTab ? 'text-slate' : 'text-terra'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}

// — App (splash + routing) —
function AppWrapper() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    async function init() {
      if (window.Capacitor?.isNative) {
        await StatusBar.setStyle({ style: 'dark' })
        await Keyboard.setAccessoryBarVisible({ isVisible: false })
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) window.history.back()
          else CapacitorApp.exitApp()
        })
      }
    }
    init()
    const t = setTimeout(() => setShowSplash(false), 2000)
    return () => {
      clearTimeout(t)
      if (window.Capacitor?.isNative) CapacitorApp.removeAllListeners()
    }
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

// New component to handle routing
function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // On initial render, check if we should redirect to home
  useEffect(() => {
    // Check if this is a fresh load/refresh of the app
    const isInitialLoad = !window.__hasInitialized;
    window.__hasInitialized = true;
    
    // If it's a fresh load and we're not already on the home page, redirect
    if (isInitialLoad && location.pathname !== '/') {
      console.log('App was refreshed on a subpage, redirecting to home...');
      navigate('/');
    }
  }, []);

  return (
     <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
      <Route path="/account" element={<AccountDetails />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/language" element={<LanguageSettings />} />
      <Route path="/settings/notifications" element={<NotificationSettings />} />
      <Route path="/settings/legal" element={<Legal />} />
      <Route path="/map-test" element={<MapTestPage />} />
      <Route path="/test-login" element={<TestLogin />} />
      
      {/* NEW: Add this route for shared maps */}
      <Route path="/map/:mapId" element={<SharedMapHandler />} />
      
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
function SharedMapHandler() {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const { setCurrentMap, archiveMaps } = useMapData();
  
  useEffect(() => {
    console.log('🔗 Handling shared map link for ID:', mapId);
    
    // SCROLL TO TOP IMMEDIATELY when handling shared link
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Find the map in our available maps
    let targetMap = null;
    
    // Check window.__mapTracker first
    if (window.__mapTracker?.mapsById?.[mapId]) {
      targetMap = window.__mapTracker.mapsById[mapId];
    } 
    // Check archiveMaps as fallback
    else if (Array.isArray(archiveMaps)) {
      targetMap = archiveMaps.find(m => m?.id === mapId);
    }
    
    if (targetMap) {
      console.log('✅ Found shared map:', targetMap.name);
      setCurrentMap(targetMap);
      
      // Navigate and ensure we're at the top
      navigate('/', { replace: true });
      
      // Extra scroll to top after navigation (slight delay)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 100);
      
    } else {
      console.log('❌ Map not found, redirecting to home');
      navigate('/', { replace: true });
      
      // Scroll to top even if map not found
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 100);
    }
  }, [mapId, archiveMaps, setCurrentMap, navigate]);
  
  // Show loading while we redirect
  return (
    <div className="min-h-screen bg-compass-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-compass-700 mx-auto mb-4"></div>
        <p className="text-compass-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  );
}

// Keep your original export statement to avoid build errors
export { AppWrapper };// Force rebuild
