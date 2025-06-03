// TextWithEmbeddedMaps2.jsx
import React from 'react';
import InteractiveMap from './InteractiveMap';

console.log("🚀 MapSyntaxParser.jsx loaded at:", new Date().toISOString());

function parseMapSyntax(text) {
  console.log("=== PARSE MAP SYNTAX DEBUG ===");
  console.log("Input text:", text);
  
  const mapRegex = /\[MAP:([^:\]]+):([^:\]]+):([^:\]]+)(?::([^:\]]+))?(?::([^:\]]+))?(?::([^:\]]+))?(?::([^:\]]+))?(?::([^:\]]+))?\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mapRegex.exec(text)) !== null) {
    console.log("Found map match:", match);
    
    // Add text before the map
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      console.log("Adding text before map:", beforeText);
      parts.push({
        type: 'text',
        content: beforeText
      });
    }

    // Parse map parameters
    const [fullMatch, style, coords, zoom, ...restParams] = match;
    console.log("Map parameters:", { style, coords, zoom, restParams });
    
    const [lat, lng] = coords.split(',').map(Number);
    console.log("Parsed coordinates:", { lat, lng });

    let title = null;
    let markers = [];
    let geojsonConfig = null;

    // Parse the remaining parameters
    for (let i = 0; i < restParams.length; i++) {
      const param = restParams[i];
      if (!param) continue;

      if (param === 'markers' && restParams[i + 1]) {
        const markersString = restParams[i + 1];
        markers = markersString.split('|').map(markerStr => {
          const [name, markerLat, markerLng] = markerStr.split(',');
          return {
            title: name.trim(),
            latitude: parseFloat(markerLat),
            longitude: parseFloat(markerLng),
            description: `${name.trim()} marker`
          };
        });
        i++;
      } else if (param === 'geojson' && restParams[i + 1]) {
        const geojsonSource = restParams[i + 1];
        const geojsonStyles = restParams[i + 2] || '';
        
        geojsonConfig = {
          source: geojsonSource,
          styles: parseGeojsonStyles(geojsonStyles)
        };
        i += 2;
      } else if (!param.includes('=') && !param.includes(',') && !title) {
        title = param;
      }
    }

    const mapData = {
      coordinates: { latitude: lat, longitude: lng },
      mapStyleKey: style,
      initialZoom: parseInt(zoom),
      title: title || null,
      markers: markers,
      geojson: geojsonConfig
    };
    
    console.log("Parsed map data:", mapData);

    parts.push({
      type: 'map',
      data: mapData
    });

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    console.log("Adding remaining text:", remainingText);
    parts.push({
      type: 'text',
      content: remainingText
    });
  }

  console.log("Final parsed parts:", parts);
  console.log("=== END PARSE MAP SYNTAX DEBUG ===");
  
  return parts;
}

function parseGeojsonStyles(styleString) {
  const styles = {};
  if (!styleString) return styles;

  const pairs = styleString.split(',');
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      const cleanKey = key.trim();
      const cleanValue = value.trim();
      
      if (cleanKey === 'opacity') {
        styles[cleanKey] = parseFloat(cleanValue);
      } else if (cleanKey === 'strokeWidth') {
        styles[cleanKey] = parseInt(cleanValue);
      } else {
        styles[cleanKey] = cleanValue;
      }
    }
  });

  return styles;
}

function TextWithEmbeddedMaps({ content, className = "" }) {
  console.log("=== TEXT WITH EMBEDDED MAPS DEBUG ===");
  console.log("Received content:", content);
  
  const parts = parseMapSyntax(content);
  
  console.log("Parsed parts:", parts);
  console.log("=== END TEXT WITH EMBEDDED MAPS DEBUG ===");

  return (
    <div className={className}>
      {parts.map((part, index) => {
        console.log(`Rendering part ${index}:`, part);
        
        if (part.type === 'text') {
          return (
            <div 
              key={index} 
              className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: part.content.replace(/\n/g, '<br>') }}
            />
          );
        } else if (part.type === 'map') {
          console.log("Rendering map with data:", part.data);
          return (
            <div key={index} className="my-8">
              {part.data.title && (
                <h4 className="text-lg font-semibold mb-3 text-center text-gray-900 dark:text-white">
                  {part.data.title}
                </h4>
              )}
              <div className="h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                <InteractiveMap
                  coordinates={part.data.coordinates}
                  markers={part.data.markers}
                  initialZoom={part.data.initialZoom}
                  mapStyleKey={part.data.mapStyleKey}
                  geojsonConfig={part.data.geojson}
                />
              </div>
              <div className="mt-2 text-center">
                {part.data.markers && part.data.markers.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                    {part.data.markers.length} location{part.data.markers.length > 1 ? 's' : ''} marked
                  </span>
                )}
                {part.data.geojson && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Geographic boundaries displayed
                  </span>
                )}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default TextWithEmbeddedMaps;