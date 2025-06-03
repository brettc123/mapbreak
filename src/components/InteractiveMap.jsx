// Scroll-Optimized InteractiveMap.jsx with Animation Performance Fixes

import React, { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyle } from './mapStyles';

console.log("🗺️ Scroll-Optimized InteractiveMap.jsx loaded at:", new Date().toISOString());

// PERFORMANCE-OPTIMIZED animation function with scroll handling
const animateLine = (map, animationConfig, onProgress = null, onComplete = null) => {
  const { data, style } = animationConfig;
  
  if (data.type !== 'LineString') {
    console.warn('Animation currently only supports LineString geometry');
    return null;
  }
  
  const coordinates = data.coordinates;
  const duration = style.duration || 2000;
  const color = style.color || '#ff0000';
  const width = style.width || 3;
  const loop = style.loop !== false;
  const loopDelay = style.loopDelay || 1000;
  
  console.log(`🎬 Starting OPTIMIZED animation: ${coordinates.length} points over ${duration}ms${loop ? ' (looping)' : ''}`);
  
  try {
    // Remove existing animation layers/sources
    if (map.getLayer('animated-line')) {
      map.removeLayer('animated-line');
    }
    if (map.getSource('animated-line')) {
      map.removeSource('animated-line');
    }
    
    // Add initial empty source
    map.addSource('animated-line', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [coordinates[0]]
        }
      }
    });
    
    // Add the line layer
    map.addLayer({
      id: 'animated-line',
      type: 'line',
      source: 'animated-line',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': 0.8
      }
    });
    
    console.log('✅ Animation layers created successfully');
  } catch (error) {
    console.error('❌ Failed to create animation layers:', error);
    return null; // Return null on failure
  }
  
  let animationId = null;
  let loopTimeout = null;
  let isRunning = true;
  let isPaused = false; // NEW: Pause state for scroll optimization
  let animationStartTime = null;
  let pausedTime = 0; // Track paused time to adjust animation
  
  // PERFORMANCE: Throttled update function to reduce render frequency during scroll
  let lastUpdateTime = 0;
  const updateThrottle = 16; // ~60fps max
  
  const animate = (currentTime) => {
    if (!isRunning) {
      console.log("🛑 Animation stopped - isRunning is false");
      return;
    }
    
    // PERFORMANCE: Skip frames if we're updating too frequently
    if (currentTime - lastUpdateTime < updateThrottle) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    lastUpdateTime = currentTime;
    
    // Handle pause/resume
    if (isPaused) {
      console.log("⏸️ Animation paused, skipping frame");
      animationId = requestAnimationFrame(animate);
      return;
    }
    
    // Initialize start time on first frame
    if (animationStartTime === null) {
      animationStartTime = currentTime;
      console.log("🎬 Animation start time initialized:", animationStartTime);
    }
    
    const elapsed = (currentTime - animationStartTime) - pausedTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // PERFORMANCE: Only log every 20% to reduce console spam but ensure we see progress
    if (Math.floor(progress * 5) !== Math.floor(((elapsed - updateThrottle) / duration) * 5)) {
      console.log(`📊 Animation progress: ${(progress * 100).toFixed(1)}% (${elapsed.toFixed(0)}ms / ${duration}ms)`);
    }
    
    // Calculate coordinates with error handling
    let currentCoordinates;
    
    try {
      if (progress >= 1) {
        currentCoordinates = [...coordinates];
      } else {
        const totalSegments = coordinates.length - 1;
        const currentPosition = progress * totalSegments;
        const segmentIndex = Math.floor(currentPosition);
        const segmentProgress = currentPosition - segmentIndex;
        
        currentCoordinates = coordinates.slice(0, segmentIndex + 1);
        
        if (segmentIndex < totalSegments && segmentProgress > 0) {
          const startPoint = coordinates[segmentIndex];
          const endPoint = coordinates[segmentIndex + 1];
          
          const interpolatedPoint = [
            startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress,
            startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress
          ];
          
          currentCoordinates.push(interpolatedPoint);
        }
      }
      
      // PERFORMANCE: Only update if source still exists and map is loaded
      const source = map.getSource('animated-line');
      if (source && map.loaded()) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: currentCoordinates
          }
        });
      } else {
        console.warn("⚠️ Animation source or map not ready, skipping update");
      }
    } catch (error) {
      console.warn('Animation update error (non-critical):', error);
    }
    
    // Call progress callback
    if (onProgress) {
      onProgress(progress);
    }
    
    // Continue animation or complete
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      console.log('🎉 Animation cycle complete!');
      if (onComplete) {
        onComplete();
      }
      
      // Loop handling
      if (loop && isRunning) {
        console.log(`🔄 Restarting animation loop in ${loopDelay}ms...`);
        loopTimeout = setTimeout(() => {
          if (isRunning && !isPaused) {
            console.log('🔄 Restarting animation loop...');
            animationStartTime = null;
            pausedTime = 0;
            
            // Reset the line
            try {
              const source = map.getSource('animated-line');
              if (source && map.loaded()) {
                source.setData({
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: [coordinates[0]]
                  }
                });
              }
            } catch (error) {
              console.warn('Loop reset error (non-critical):', error);
            }
            
            animationId = requestAnimationFrame(animate);
          }
        }, loopDelay);
      }
    }
  };
  
  // Start the animation
  console.log('🚀 Starting optimized animation...');
  animationId = requestAnimationFrame(animate);
  
  // Return control object with pause/resume capabilities
  const controller = {
    cleanup: () => {
      console.log('🧹 Cleaning up animation...');
      isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (loopTimeout) {
        clearTimeout(loopTimeout);
      }
    },
    pause: () => {
      console.log('⏸️ Pausing animation...');
      isPaused = true;
    },
    resume: () => {
      console.log('▶️ Resuming animation...');
      isPaused = false;
    },
    isRunning: () => {
      const running = isRunning && !isPaused;
      console.log(`🔍 Animation controller status: isRunning=${isRunning}, isPaused=${isPaused}, result=${running}`);
      return running;
    }
  };
  
  console.log('🎯 Animation controller created with methods:', Object.keys(controller));
  return controller;
};

// Existing GeoJSON function (unchanged)
const addGeojsonLayer = async (map, geojsonConfig) => {
  try {
    console.log("Adding GeoJSON layer with config:", geojsonConfig);
    
    if (!geojsonConfig || !geojsonConfig.data) {
      console.warn("No GeoJSON data provided");
      return;
    }

    if (map.getLayer('geojson-fill')) {
      map.removeLayer('geojson-fill');
    }
    if (map.getLayer('geojson-stroke')) {
      map.removeLayer('geojson-stroke');
    }
    if (map.getSource('geojson-data')) {
      map.removeSource('geojson-data');
    }

    map.addSource('geojson-data', {
      type: 'geojson',
      data: geojsonConfig.data
    });

    const defaultStyle = {
      fill: '#3388ff',
      stroke: '#3388ff',
      opacity: 0.8,
      fillOpacity: 0.3
    };

    const style = { ...defaultStyle, ...geojsonConfig.style };

    if (geojsonConfig.data.type === 'Polygon' || geojsonConfig.data.type === 'MultiPolygon') {
      map.addLayer({
        id: 'geojson-fill',
        type: 'fill',
        source: 'geojson-data',
        paint: {
          'fill-color': style.fill,
          'fill-opacity': style.fillOpacity
        }
      });
    }

    map.addLayer({
      id: 'geojson-stroke',
      type: 'line',
      source: 'geojson-data',
      paint: {
        'line-color': style.stroke,
        'line-width': 3,
        'line-opacity': style.opacity
      }
    });

    console.log("GeoJSON layer added successfully");

  } catch (error) {
    console.error("Error adding GeoJSON layer:", error);
    throw error;
  }
};

function InteractiveMap({ 
  mapId = 'default-map',
  coordinates, 
  markers = [], 
  initialZoom, 
  mapStyleKey = 'default',
  geojsonConfig = null,
  animationConfig = null,
  showDebugOverlay = false
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const animationController = useRef(null); // Changed from cleanup to controller
  const intersectionObserver = useRef(null);
  
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Track visibility
  
  // PERFORMANCE: Throttled progress update to prevent excessive re-renders
  const throttledSetProgress = useCallback((progress) => {
    setAnimationProgress(prevProgress => {
      // Only update if change is significant (>1%)
      if (Math.abs(progress - prevProgress) > 0.01) {
        return progress;
      }
      return prevProgress;
    });
  }, []);
  
  // Animation control function with visibility awareness
  const startAnimation = useCallback(() => {
    console.log("🎯 startAnimation called - checking conditions...");
    console.log("- Map exists:", !!map.current);
    console.log("- Animation config exists:", !!animationConfig);
    console.log("- Currently animating:", isAnimating);
    console.log("- Map loaded:", map.current ? map.current.loaded() : 'N/A');
    
    if (!map.current) {
      console.log("❌ No map instance");
      return;
    }
    if (!animationConfig) {
      console.log("❌ No animation config");
      return;
    }
    if (!map.current.loaded()) {
      console.log("❌ Map not loaded yet, retrying in 200ms...");
      setTimeout(startAnimation, 200);
      return;
    }
    
    // FIXED: Check if animation is actually running, not just the state
    if (isAnimating && animationController.current?.isRunning?.()) {
      console.log("❌ Already animating (confirmed by controller)");
      return;
    }
    
    // FIXED: Reset state if we think we're animating but controller says no
    if (isAnimating && !animationController.current?.isRunning?.()) {
      console.log("🔄 State sync issue detected - resetting isAnimating state");
      setIsAnimating(false);
      setAnimationProgress(0);
    }
    
    console.log("✅ All conditions met, starting animation for map:", mapId);
    
    // Clean up any existing animation BEFORE setting state
    if (animationController.current) {
      console.log("🧹 Cleaning up existing animation");
      animationController.current.cleanup();
      animationController.current = null;
    }
    
    // FIXED: Only set isAnimating AFTER successful animation creation
    console.log("🎬 Creating new animation with config:", animationConfig);
    const newAnimationController = animateLine(
      map.current, 
      animationConfig,
      throttledSetProgress,
      () => {
        console.log("🎉 Animation completed callback fired");
        if (animationConfig.style && animationConfig.style.loop === false) {
          setIsAnimating(false);
          setAnimationProgress(1);
        }
      }
    );
    
    if (newAnimationController) {
      console.log("✅ Animation controller created successfully");
      animationController.current = newAnimationController;
      setIsAnimating(true);  // MOVED: Only set after successful creation
      setAnimationProgress(0);
    } else {
      console.log("❌ Failed to create animation controller");
      setIsAnimating(false);
      setAnimationProgress(0);
    }
    
    console.log("🎯 Animation setup complete. Controller exists:", !!animationController.current);
  }, [mapId, animationConfig, isAnimating, throttledSetProgress]);
  
  // PERFORMANCE: Intersection Observer to pause animation when not visible
  useEffect(() => {
    if (!mapContainer.current || !animationConfig) return;
    
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const newIsVisible = entry.isIntersecting;
        
        console.log(`👁️ Map visibility changed: ${newIsVisible ? 'visible' : 'hidden'}`);
        setIsVisible(newIsVisible);
        
        // FIXED: Only control existing animations, don't interfere with startup
        if (animationController.current && isAnimating) {
          if (newIsVisible) {
            console.log('▶️ Resuming animation due to visibility');
            animationController.current.resume();
          } else {
            console.log('⏸️ Pausing animation due to invisibility');
            animationController.current.pause();
          }
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of map is visible
        rootMargin: '50px' // Start animation a bit before fully visible
      }
    );
    
    intersectionObserver.current.observe(mapContainer.current);
    
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [animationConfig, isAnimating]); // Added isAnimating dependency
  
  useEffect(() => {
    if (!mapContainer.current) {
      console.error("InteractiveMap: Container ref is null");
      return;
    }
    if (map.current) return;
    
    const mapStyle = getMapStyle(mapStyleKey);
    
    console.log("=== INTERACTIVE MAP INIT DEBUG ===");
    console.log("Style Key:", mapStyleKey);
    console.log("Coordinates:", coordinates);
    console.log("Initial zoom:", initialZoom);
    console.log("Animation Config:", animationConfig);
    console.log("=== END INIT DEBUG ===");
    
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [coordinates.longitude, coordinates.latitude],
        zoom: initialZoom,
        // PERFORMANCE: Optimize for mobile
        preserveDrawingBuffer: true,
        antialias: false // Disable for better performance on mobile
      });
      
      console.log("Map instance created:", map.current);
      
      // Add navigation control
      map.current.addControl(new maplibregl.NavigationControl());
      
      map.current.on('styleimagemissing', (e) => {
        console.warn(`Missing image: ${e.id}`);
      });
      
      map.current.on('load', async () => {
        console.log("🗺️ Map loaded successfully!");
        
        // Add main marker
        const mainMarker = new maplibregl.Marker({ color: '#ff3b30' })
          .setLngLat([coordinates.longitude, coordinates.latitude])
          .addTo(map.current);
        console.log("Main marker added:", mainMarker);
        
        // Add additional markers
        if (markers && markers.length > 0) {
          console.log("Adding", markers.length, "additional markers");
          
          markers.forEach((marker, index) => {
            if (!marker.latitude || !marker.longitude) {
              console.warn(`Marker ${index} has invalid coordinates:`, marker);
              return;
            }
            
            const popup = new maplibregl.Popup({ offset: 25 })
              .setHTML(`
                <h3 style="font-weight:bold; margin-bottom:4px;">${marker.title}</h3>
                ${marker.description ? `<p style="margin-top:0;">${marker.description}</p>` : ''}
              `);
            
            const markerElement = new maplibregl.Marker({ color: '#007aff' })
              .setLngLat([marker.longitude, marker.latitude])
              .setPopup(popup)
              .addTo(map.current);
              
            console.log(`Marker ${index} added at:`, [marker.longitude, marker.latitude]);
          });
        }
        
        // Add GeoJSON layer if provided
        if (geojsonConfig) {
          console.log("Adding GeoJSON layer:", geojsonConfig);
          await addGeojsonLayer(map.current, geojsonConfig);
        }
        
        // Setup animation if provided
        if (animationConfig) {
          console.log("🎬 Animation config detected:", animationConfig);
          
          // Auto-start if specified
          if (animationConfig.style && animationConfig.style.autoStart) {
            console.log("🚀 Auto-starting animation in 500ms...");
            setTimeout(() => {
              console.log("🎯 Attempting to start animation now...");
              startAnimation();
            }, 500); // Reduced delay - was causing issues
          } else {
            console.log("🎬 Animation ready for manual trigger");
          }
        }
      });
      
      map.current.on('error', (e) => {
        console.error("Map error:", e);
      });
      
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
    
    return () => {
      if (animationController.current) {
        animationController.current.cleanup();
        animationController.current = null;
      }
      
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
      
      if (map.current) {
        console.log("Cleaning up map...");
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, initialZoom, mapStyleKey, geojsonConfig, animationConfig, startAnimation]);
  
  // Expose animation function globally for button access
  useEffect(() => {
    if (map.current && mapId) {
      const mapElement = mapContainer.current;
      if (mapElement) {
        mapElement.startAnimation = startAnimation;
        mapElement.setAttribute('data-map-id', mapId);
      }
    }
  }, [mapId, startAnimation]);
  
  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Enhanced debug info overlay */}
      {showDebugOverlay && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs">
          <div>Map: {mapId}</div>
          <div>Style: {mapStyleKey}</div>
          <div>Animation: {animationConfig ? '✅' : '❌'}</div>
          <div>Visible: {isVisible ? '✅' : '❌'}</div>
          {animationConfig && (
            <>
              <div>Auto-start: {animationConfig.style?.autoStart ? '✅' : '❌'}</div>
              <div>Loop: {animationConfig.style?.loop !== false ? '✅' : '❌'}</div>
              <div>Duration: {animationConfig.style?.duration || 2000}ms</div>
              <div>Color: {animationConfig.style?.color || '#ff0000'}</div>
              <div>Running: {animationController.current?.isRunning() ? '✅' : '❌'}</div>
            </>
          )}
          <div>Animating: {isAnimating ? '✅' : '❌'}</div>
          <div>Progress: {Math.round(animationProgress * 100)}%</div>
        </div>
      )}
      
      {/* Visibility indicator for debugging */}
      {!isVisible && showDebugOverlay && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
          👁️ Not Visible
        </div>
      )}
      
      {/* Animation progress bar - show for non-looping animations */}
      {animationConfig && isAnimating && animationConfig.style?.loop === false && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Animating Route
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {Math.round(animationProgress * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${animationProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Loop indicator for looping animations */}
      {animationConfig && isAnimating && animationConfig.style?.loop !== false && (
        <div className="absolute bottom-4 right-4">
          <div className={`px-3 py-1 rounded-full text-sm shadow-lg ${
            isVisible ? 'bg-blue-500/90 text-white' : 'bg-orange-500/90 text-white'
          }`}>
            {isVisible ? '🔄' : '⏸️'} Looping ({Math.round(animationProgress * 100)}%)
          </div>
        </div>
      )}
      
      {/* Manual animation button - show for debugging even with autoStart */}
      {animationConfig && !isAnimating && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={startAnimation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            ▶️ Start Animation
          </button>
        </div>
      )}
      
      {/* Debug reset button - show if state is stuck */}
      {animationConfig && isAnimating && showDebugOverlay && (
        <div className="absolute top-16 right-4 z-50">
          <button
            onClick={() => {
              console.log('🔄 Force resetting animation state...');
              if (animationController.current) {
                animationController.current.cleanup();
                animationController.current = null;
              }
              setIsAnimating(false);
              setAnimationProgress(0);
              console.log('✅ Animation state reset complete');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-lg transition-colors text-sm"
          >
            🔄 Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default InteractiveMap;