import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Simple test component to verify maplibre works
function SimpleMapTest() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Initialize map on component mount
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return; // Make sure container exists
    
    console.log("SimpleMapTest: Initializing test map...");
    
    try {
      // Create a simple map
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=OnmsIibZBnz9Mb3wEoJX',
        center: [-75.1652, 39.9526], // Philadelphia coordinates
        zoom: 12
      });
      
      // Add navigation control
      map.current.addControl(new maplibregl.NavigationControl());
      
      // Log when map is loaded successfully
      map.current.on('load', () => {
        console.log("SimpleMapTest: Map loaded successfully!");
        
        // Add a marker
        new maplibregl.Marker({ color: '#FF0000' })
          .setLngLat([-75.1652, 39.9526])
          .addTo(map.current); // Removed TypeScript casting
      });
      
      // Log any map errors
      map.current.on('error', (e) => {
        console.error("SimpleMapTest: Map error:", e);
      });
      
    } catch (error) {
      console.error("SimpleMapTest: Failed to initialize map:", error);
    }
    
    // Clean up function
    return () => {
      if (map.current) {
        console.log("SimpleMapTest: Removing map...");
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">Map Test Component</h2>
      <p className="mb-2">This is a simple test to verify MapLibre is working correctly.</p>
      <div 
        ref={mapContainer} 
        className="w-full h-80 border border-gray-300 rounded-lg overflow-hidden"
      />
    </div>
  );
}

export default SimpleMapTest;