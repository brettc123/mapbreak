import { MapLocation } from '../types/Map';

// Sample map data for the application
export const mapData: MapLocation[] = [
  {
    id: '1',
    name: 'Venice, Italy',
    coordinates: {
      latitude: 45.4408,
      longitude: 12.3155,
    },
    zoom: 13,
    featured: true,
    featuredDate: new Date().toISOString(),
    imageUrl: 'https://images.pexels.com/photos/1796736/pexels-photo-1796736.jpeg',
    description: 'Venice, the "Floating City," is built on 118 small islands separated by canals and linked by over 400 bridges. Its unique structure was developed out of necessity, as refugees from the mainland sought protection from invaders in the lagoon.',
    shortDescription: 'A city built entirely on water, with canals instead of streets',
    geographicalFeatures: [
      'Built across 118 islands in a lagoon',
      'No traditional roads, only canals and pedestrian paths',
      'Slowly sinking at a rate of 1-2mm per year',
      'Protected from the Adriatic Sea by a series of barrier islands'
    ],
    funFacts: [
      'Venice has over 400 foot bridges and around 170 boat canals',
      'The entire city is listed as a UNESCO World Heritage Site',
      'Local transportation consists entirely of boats and walking',
      'The city hosts approximately 20 million tourists each year'
    ],
    historicalContext: 'Founded in 421 CE, Venice developed as a major maritime power during the Middle Ages and Renaissance. The need to build on water led to engineering innovations and unique urban planning that has influenced architecture worldwide.',
    tags: ['island city', 'canals', 'maritime', 'medieval', 'unesco']
  },
  {
    id: '2',
    name: 'Manhattan, New York',
    coordinates: {
      latitude: 40.7831,
      longitude: -73.9712,
    },
    zoom: 12,
    featured: false,
    imageUrl: 'https://images.pexels.com/photos/2224861/pexels-photo-2224861.png',
    description: 'Manhattan\'s iconic grid system was established by the Commissioners\' Plan of 1811, creating a uniform street layout that has defined New York\'s development. This deliberate planning stands in contrast to the organic growth of older cities and has influenced urban planning worldwide.',
    shortDescription: 'Famous for its grid street system and skyscrapers',
    geographicalFeatures: [
      'An island bounded by the Hudson, East, and Harlem Rivers',
      'Relatively flat in midtown and downtown, hillier in northern sections',
      'Built on solid bedrock, allowing for tall skyscrapers',
      'Contains the massive green space of Central Park in its center'
    ],
    funFacts: [
      'Manhattan\'s street grid has 12 avenues and 220 crosstown streets',
      'The bedrock is closest to the surface in midtown, explaining the cluster of skyscrapers there',
      'Manhattan was purchased from Native Americans in 1626 for goods valued at 60 guilders',
      'It\'s one of the most densely populated areas in the world'
    ],
    historicalContext: 'Originally settled by the Lenape Native Americans, Manhattan became a Dutch settlement called New Amsterdam in 1624 before being renamed New York when the British took control in 1664. The 1811 grid plan shaped its modern development.',
    tags: ['grid system', 'urban planning', 'skyscrapers', 'island', 'metropolitan']
  },
  {
    id: '3',
    name: 'Paris, France',
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    zoom: 12,
    featured: false,
    imageUrl: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg',
    description: 'Paris\'s distinctive layout centers around wide boulevards radiating from circular plazas, the result of Baron Haussmann\'s massive urban renovation in the 1850s and 1860s. This design dramatically transformed the medieval city into a modern capital with improved circulation, sanitation, and aesthetics.',
    shortDescription: 'Famous for its radial boulevard system and historical architecture',
    geographicalFeatures: [
      'Built along the Seine River with Right and Left Banks',
      'Relatively flat terrain with a few hills like Montmartre',
      'Compact city with a clear center and radiating boulevards',
      'Dense urban core surrounded by a ring road (the Périphérique)'
    ],
    funFacts: [
      'Paris was originally a Celtic settlement on an island in the Seine (now Île de la Cité)',
      'The city\'s boulevards were partly designed wide enough to prevent barricades during revolts',
      'Paris is divided into 20 arrondissements (districts) arranged in a clockwise spiral',
      'The city has over 400 parks and gardens covering 3,000 hectares'
    ],
    historicalContext: 'The radical transformation of Paris under Napoleon III and Baron Haussmann in the 19th century created the city we recognize today, replacing medieval neighborhoods with grand boulevards and uniform buildings.',
    tags: ['haussman', 'boulevards', 'seine', 'arrondissements', 'historic']
  },
  {
    id: '4',
    name: 'Barcelona, Spain',
    coordinates: {
      latitude: 41.3851,
      longitude: 2.1734,
    },
    zoom: 13,
    featured: false,
    imageUrl: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg',
    description: 'Barcelona features a distinctive grid pattern with octagonal intersections in its Eixample district, designed by Ildefons Cerdà in the 19th century. This innovative urban plan allowed for greater sunlight, improved ventilation, and efficient traffic flow.',
    shortDescription: 'Known for its unique octagonal city blocks and modernist architecture',
    geographicalFeatures: [
      'Situated between the Mediterranean Sea and the Serra de Collserola mountain range',
      'Built on a gentle slope rising from the sea',
      'Features a distinctive grid pattern with chamfered corners in the Eixample district',
      'Bounded by two rivers: the Besòs and the Llobregat'
    ],
    funFacts: [
      'The Eixample district\'s octagonal intersections were designed to allow trams to turn more easily',
      'Barcelona\'s grid system includes interior courtyards that were meant to provide green space for each block',
      'The city has 4.5 km of beaches, created for the 1992 Olympics',
      'The Gothic Quarter contains remains of the Roman city of Barcino'
    ],
    historicalContext: 'Barcelona\'s famous Eixample district was designed in 1859 when the city\'s medieval walls were demolished, allowing for planned expansion that harmonized urban living with light, space, and greenery.',
    tags: ['eixample', 'grid', 'cerda', 'mediterranean', 'gaudi']
  },
  {
    id: '5',
    name: 'Tokyo, Japan',
    coordinates: {
      latitude: 35.6762,
      longitude: 139.6503,
    },
    zoom: 11,
    featured: false,
    imageUrl: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg',
    description: 'Tokyo\'s urban fabric reflects its organic growth and reconstruction after disasters, resulting in a complex layout without a comprehensive grid system. Instead, neighborhoods developed around railway stations, creating a polycentric metropolitan structure linked by the world\'s most extensive urban railway network.',
    shortDescription: 'A megacity built around railway stations rather than streets',
    geographicalFeatures: [
      'Built on the Kanto Plain with Tokyo Bay to the east',
      'Crossed by numerous rivers and canals',
      'Organized into 23 special wards, each functioning like a small city',
      'Development follows railway lines rather than street grids'
    ],
    funFacts: [
      'Tokyo has the world\'s most complex urban railway system with over 150 train lines',
      'Many streets have no names; locations are identified by block and building numbers',
      'The city sits at the junction of three tectonic plates, making it earthquake-prone',
      'Tokyo was originally a small fishing village called Edo'
    ],
    historicalContext: 'Tokyo\'s modern form emerged from the ashes of the 1923 Great Kanto Earthquake and WWII bombing. Rather than imposing a grid system, post-war planners focused on transit-oriented development, creating a unique urban pattern centered around railway stations.',
    tags: ['transit-oriented', 'railway', 'organic growth', 'megacity', 'polycentric']
  }
];

// Function to get the map of the day
export const getMapOfTheDay = (): MapLocation => {
  const today = new Date().toISOString().split('T')[0];
  
  // Find a map that's marked as featured for today
  const featuredMap = mapData.find(map => 
    map.featured && map.featuredDate?.split('T')[0] === today
  );
  
  // If no map is explicitly featured for today, select one based on the date
  if (!featuredMap) {
    // Use the current date to select a map (ensures the same map is shown all day)
    const dayOfYear = getDayOfYear(new Date());
    const mapIndex = dayOfYear % mapData.length;
    return mapData[mapIndex];
  }
  
  return featuredMap;
};

// Helper function to get day of year (0-365)
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Function to get maps for archive
export const getArchiveMaps = (): MapLocation[] => {
  // Return all maps except today's featured map
  const mapOfTheDay = getMapOfTheDay();
  return mapData.filter(map => map.id !== mapOfTheDay.id);
};

// Function to get a map by ID
export const getMapById = (id: string): MapLocation | undefined => {
  return mapData.find(map => map.id === id);
};

// Function to search maps by query
export const searchMaps = (query: string): MapLocation[] => {
  const lowerCaseQuery = query.toLowerCase();
  return mapData.filter(map => 
    map.name.toLowerCase().includes(lowerCaseQuery) ||
    map.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)) ||
    map.description.toLowerCase().includes(lowerCaseQuery)
  );
};