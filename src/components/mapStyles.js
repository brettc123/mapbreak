// WORKING mapStyles.js - Updated for 2025 with current tile servers
// All URLs tested and working as of May 2025

const mapStyles = {
  // DEFAULT: Clean OpenStreetMap
  'default': {
    version: 8,
    sources: {
      'osm': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
        maxzoom: 19
      }
    },
    layers: [{
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }]
  },

  // CLASSIC B&W: Stamen Toner (NOW HOSTED BY STADIA MAPS)
  'classic-bw': {
    version: 8,
    sources: {
      'stamen-toner': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/">Stadia Maps</a>. Data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.'
      }
    },
    layers: [{
      id: 'stamen-toner',
      type: 'raster',
      source: 'stamen-toner'
    }]
  },

  // VINTAGE: Stamen Watercolor (NOW HOSTED BY STADIA MAPS)
  'vintage': {
    version: 8,
    sources: {
      'stamen-watercolor': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/">Stadia Maps</a>. Data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.'
      }
    },
    layers: [{
      id: 'stamen-watercolor',
      type: 'raster',
      source: 'stamen-watercolor'
    }]
  },

  // SATELLITE: Esri World Imagery (RELIABLE, FREE)
  'satellite': {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }
    },
    layers: [{
      id: 'esri-satellite',
      type: 'raster',
      source: 'esri-satellite'
    }]
  },

  // TERRAIN: Stamen Terrain (NOW HOSTED BY STADIA MAPS)
  'terrain': {
    version: 8,
    sources: {
      'stamen-terrain': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/">Stadia Maps</a>. Data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.'
      }
    },
    layers: [{
      id: 'stamen-terrain',
      type: 'raster',
      source: 'stamen-terrain'
    }]
  },

  // LIGHT B&W: Stamen Toner Lite (SOFTER VERSION)
  'light-bw': {
    version: 8,
    sources: {
      'stamen-toner-lite': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/">Stadia Maps</a>. Data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors.'
      }
    },
    layers: [{
      id: 'stamen-toner-lite',
      type: 'raster',
      source: 'stamen-toner-lite'
    }]
  },

  // SEPIA: Custom sepia filter over satellite
  'sepia': {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Tiles © Esri'
      }
    },
    layers: [{
      id: 'sepia-base',
      type: 'raster',
      source: 'esri-satellite',
      paint: {
        'raster-opacity': 0.8,
        'raster-hue-rotate': 25,
        'raster-saturation': 0.3,
        'raster-brightness-min': 0.3,
        'raster-brightness-max': 0.7
      }
    }]
  },

  // PARCHMENT: Light, historical look using Toner Lite
  'parchment': {
    version: 8,
    sources: {
      'stamen-toner-lite': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: 'Map tiles by <a href="https://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/">Stadia Maps</a>.'
      }
    },
    layers: [{
      id: 'parchment-base',
      type: 'raster',
      source: 'stamen-toner-lite',
      paint: {
        'raster-opacity': 0.9,
        'raster-hue-rotate': 15,
        'raster-saturation': 0.2,
        'raster-brightness-min': 0.8,
        'raster-brightness-max': 1.2
      }
    }]
  },

  // DARK: CartoDB Dark Matter (FREE, RELIABLE)
  'dark': {
    version: 8,
    sources: {
      'cartodb-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      }
    },
    layers: [{
      id: 'cartodb-dark',
      type: 'raster',
      source: 'cartodb-dark'
    }]
  },

  // POSITRON: CartoDB Light (CLEAN, MINIMAL)
  'positron': {
    version: 8,
    sources: {
      'cartodb-positron': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      }
    },
    layers: [{
      id: 'cartodb-positron',
      type: 'raster',
      source: 'cartodb-positron'
    }]
  }
};

// Function to get map style with fallback
export const getMapStyle = (styleKey = 'default') => {
  console.log(`Getting map style: ${styleKey}`);
  
  // Check if the requested style exists
  if (mapStyles[styleKey]) {
    console.log(`Found style: ${styleKey}`);
    return mapStyles[styleKey];
  }
  
  // Fallback to reliable options
  console.warn(`Style '${styleKey}' not found, falling back to default`);
  
  if (mapStyles['default']) {
    return mapStyles['default'];
  }
  
  // This should never happen, but just in case
  console.error('Even default style not found!');
  return mapStyles['default'];
};

// Get all available style names
export const getAvailableStyles = () => {
  return Object.keys(mapStyles);
};

// Check if a style exists
export const hasStyle = (styleKey) => {
  return styleKey in mapStyles;
};

export default mapStyles;