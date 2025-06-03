// FIXED TextWithEmbeddedMaps.jsx with Enhanced Animation Support
// This version properly handles loop configuration and debugging

import React from 'react';
import InteractiveMap from './InteractiveMap';

function TextWithEmbeddedMaps({ content }) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  // Simple parser for MAP syntax
  const parseMapSyntax = (text) => {
    const parts = [];
    let lastIndex = 0;
    
    // Find [MAP:...] patterns
    const mapRegex = /\[MAP:([^\[]*(?:\{[^}]*\}[^\[]*)*)?\]/g;
    let match;

    while ((match = mapRegex.exec(text)) !== null) {
      // Add text before the map
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText.trim()) {
          parts.push({ type: 'text', content: beforeText });
        }
      }

      // Parse the map content
      const mapContent = match[1];
      console.log("🗺️ Found MAP syntax, parsing:", mapContent);
      const mapData = parseMapContent(mapContent);
      
      if (mapData) {
        console.log("✅ Successfully parsed map data:", mapData);
        parts.push({ type: 'map', data: mapData });
      } else {
        console.log("❌ Failed to parse map data");
        parts.push({ type: 'text', content: match[0] });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    return parts;
  };

  // ENHANCED parser for individual map content with FIXED animation support
  const parseMapContent = (content) => {
    try {
      if (!content) return null;

      console.log("🔍 Parsing map content:", content);

      // Split by colons, handling nested JSON
      const parts = [];
      let currentPart = '';
      let braceCount = 0;
      let inQuotes = false;
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        if (char === '"') inQuotes = !inQuotes;
        if (!inQuotes) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        if (char === ':' && braceCount === 0 && !inQuotes) {
          parts.push(currentPart.trim());
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      
      if (currentPart.trim()) {
        parts.push(currentPart.trim());
      }
      
      console.log("📋 Split into parts:", parts);
      
      if (parts.length < 4) {
        console.log("❌ Not enough parts for a valid map");
        return null;
      }
      
      const [style, coords, zoom, title, ...rest] = parts;
      console.log("🎯 Basic parts:", { style, coords, zoom, title });
      console.log("🔧 Rest parts:", rest);
      
      const [lat, lng] = coords.split(',').map(Number);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log("❌ Invalid coordinates");
        return null;
      }
      
      const mapData = {
        coordinates: { latitude: lat, longitude: lng },
        mapStyleKey: style || 'default',
        initialZoom: parseInt(zoom, 10) || 13,
        title: title && title !== 'null' ? title : null,
        markers: [],
        geojsonConfig: null,
        animationConfig: null
      };
      
      console.log("🗺️ Base map data created:", mapData);
      
      // FIXED: Enhanced animation parsing with proper loop handling
      const animationIndex = rest.findIndex(r => r === 'animation');
      console.log("🎬 Looking for animation... found at index:", animationIndex);
      
      if (animationIndex !== -1 && rest[animationIndex + 1] === 'inline') {
        console.log("🎬 Found animation:inline, parsing...");
        
        try {
          // Find the JSON part
          const jsonPart = rest[animationIndex + 2];
          console.log("📝 Animation JSON part:", jsonPart);
          
          if (!jsonPart) {
            console.log("❌ No JSON data found for animation");
          } else {
            const animationData = JSON.parse(jsonPart);
            console.log("✅ Parsed animation JSON:", animationData);
            
            // FIXED: Default animation style with PROPER loop handling
            const animationStyleObj = {
              duration: 3000,
              color: '#ff0000',
              width: 3,
              autoStart: true,
              loop: true, // CRITICAL FIX: Default to true for looping
              loopDelay: 1000 // Default delay between loops
            };
            
            // Find styling part
            const stylingPart = rest[animationIndex + 3];
            console.log("🎨 Animation styling part:", stylingPart);
            
            // ENHANCED: Parse styling with better handling
            if (stylingPart && stylingPart.includes('=')) {
              console.log("🎨 Parsing animation styling...");
              
              // Split by comma, but be careful about values that might contain commas
              const stylePairs = stylingPart.split(',');
              
              for (const pair of stylePairs) {
                const [key, value] = pair.split('=');
                if (key && value) {
                  const cleanKey = key.trim();
                  const cleanValue = value.trim();
                  console.log(`🔧 Setting ${cleanKey} = ${cleanValue}`);
                  
                  switch (cleanKey) {
                    case 'color':
                      animationStyleObj.color = cleanValue;
                      break;
                    case 'duration':
                      const numValue = parseInt(cleanValue);
                      if (!isNaN(numValue)) {
                        animationStyleObj.duration = numValue;
                      }
                      break;
                    case 'width':
                      const widthValue = parseInt(cleanValue);
                      if (!isNaN(widthValue)) {
                        animationStyleObj.width = widthValue;
                      }
                      break;
                    case 'autoStart':
                      animationStyleObj.autoStart = cleanValue === 'true';
                      break;
                    case 'loop':
                      // FIXED: Properly handle loop setting
                      animationStyleObj.loop = cleanValue === 'true';
                      break;
                    case 'loopDelay':
                      const delayValue = parseInt(cleanValue);
                      if (!isNaN(delayValue)) {
                        animationStyleObj.loopDelay = delayValue;
                      }
                      break;
                  }
                }
              }
            }
            
            // CRITICAL: Validate animation data
            if (!animationData.coordinates || !Array.isArray(animationData.coordinates)) {
              console.error("❌ Invalid animation data - no coordinates array");
              return mapData; // Return without animation
            }
            
            if (animationData.coordinates.length < 2) {
              console.error("❌ Invalid animation data - need at least 2 coordinates");
              return mapData; // Return without animation
            }
            
            mapData.animationConfig = {
              data: animationData,
              style: animationStyleObj
            };
            
            console.log("🎉 ANIMATION CONFIG CREATED:", mapData.animationConfig);
            console.log("🔄 Loop enabled:", animationStyleObj.loop);
            console.log("⚡ Auto-start:", animationStyleObj.autoStart);
            console.log("⏱️ Duration:", animationStyleObj.duration + "ms");
          }
        } catch (e) {
          console.error("❌ Failed to parse animation:", e);
          console.error("Raw animation parts:", rest.slice(animationIndex));
        }
      } else {
        console.log("❌ No animation:inline found in parts");
      }
      
      // Handle GeoJSON (existing functionality - unchanged)
      const geojsonIndex = rest.findIndex(r => r === 'geojson');
      if (geojsonIndex !== -1 && rest[geojsonIndex + 1] === 'inline') {
        console.log("📍 Found geojson:inline, parsing...");
        
        try {
          // Find the GeoJSON part
          const geojsonStart = content.indexOf('geojson:inline:') + 15;
          
          // Find the end of the GeoJSON (look for next section or end)
          let geojsonEnd = content.length;
          const nextSectionIndex = content.indexOf(':animation:', geojsonStart);
          if (nextSectionIndex !== -1) {
            geojsonEnd = nextSectionIndex;
          } else {
            // Look for styling section
            const stylingSectionRegex = /:([^:]*=[^:]*(?:,[^:]*=[^:]*)*)$/;
            const styleMatch = content.substring(geojsonStart).match(stylingSectionRegex);
            if (styleMatch) {
              geojsonEnd = geojsonStart + content.substring(geojsonStart).indexOf(styleMatch[0]);
            }
          }
          
          let geojsonStr = content.substring(geojsonStart, geojsonEnd);
          
          // Extract styling if present
          let styling = '';
          const lastPart = rest[rest.length - 1];
          if (lastPart && lastPart.includes('=') && !lastPart.includes('{')) {
            styling = lastPart;
            // Remove styling from geojsonStr if it was included
            const styleIndex = geojsonStr.lastIndexOf(':' + styling);
            if (styleIndex !== -1) {
              geojsonStr = geojsonStr.substring(0, styleIndex);
            }
          }
          
          console.log("Extracted GeoJSON string:", geojsonStr);
          console.log("Extracted styling:", styling);
          
          const geojsonData = JSON.parse(geojsonStr);
          
          const styleObj = {
            fill: '#3388ff',
            stroke: '#3388ff',
            opacity: 0.6,
            fillOpacity: 0.2
          };
          
          if (styling) {
            styling.split(',').forEach(pair => {
              const [key, value] = pair.split('=');
              if (key && value) {
                const cleanKey = key.trim();
                const cleanValue = value.trim();
                
                if (cleanKey === 'fill' || cleanKey === 'stroke') {
                  styleObj[cleanKey] = cleanValue;
                } else if (cleanKey === 'opacity' || cleanKey === 'fillOpacity') {
                  const numValue = parseFloat(cleanValue);
                  if (!isNaN(numValue)) {
                    styleObj[cleanKey] = numValue;
                  }
                }
              }
            });
          }
          
          mapData.geojsonConfig = {
            data: geojsonData,
            style: styleObj
          };
          
          console.log("✅ GeoJSON config created:", mapData.geojsonConfig);
        } catch (e) {
          console.error("❌ Failed to parse GeoJSON:", e);
        }
      }
      
      console.log("🎯 FINAL MAP DATA:", mapData);
      return mapData;
    } catch (error) {
      console.error("💥 Error parsing map content:", error);
      return null;
    }
  };

  const parts = parseMapSyntax(content);
  console.log("🎯 Final parsed parts:", parts);
  
  if (parts.length === 0) {
    return <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content}</div>;
  }
  
  return (
    <div>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div 
              key={index} 
              className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ 
                __html: part.content.replace(/\n/g, '<br>') 
              }}
            />
          );
        } else if (part.type === 'map') {
          console.log(`🗺️ Rendering map ${index} with data:`, part.data);
          console.log(`🎬 Animation config for map ${index}:`, part.data.animationConfig);
          
          return (
            <div key={index} className="my-8">
              {part.data.title && (
                <h4 className="text-lg font-semibold mb-3 text-center text-gray-900 dark:text-white">
                  {part.data.title}
                </h4>
              )}
              <div 
                className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
                style={{ 
                  height: '400px', 
                  width: '100%',
                  minHeight: '400px'
                }}
              >
                <InteractiveMap
                  mapId={`embedded-map-${index}`}
                  coordinates={part.data.coordinates}
                  markers={part.data.markers}
                  initialZoom={part.data.initialZoom}
                  mapStyleKey={part.data.mapStyleKey}
                  geojsonConfig={part.data.geojsonConfig}
                  animationConfig={part.data.animationConfig}
                  showDebugOverlay={false} // Disabled for performance
                  containerStyle={{ height: '100%', width: '100%' }}
                />
              </div>
              {part.data.geojsonConfig && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    📍 Geographic boundaries displayed
                  </span>
                </div>
              )}
              {part.data.animationConfig && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    ⚡ Animated route: {part.data.animationConfig.style.duration / 1000}s journey 
                    {part.data.animationConfig.style.loop ? ' (looping)' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default TextWithEmbeddedMaps;