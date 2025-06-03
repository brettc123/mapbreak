import { createClient } from 'contentful';
import { ContentfulMapEntry, ContentfulImageTagEntry } from '../types/Map';
import { Document } from '@contentful/rich-text-types';

const client = createClient({
  space: 'qdezmj7bsmhe',
  accessToken: 'spMXcZwOzzn78kMHfOLS718MB1E0JJKfFMQuZYQfDKc',
});

export async function getMapEntries() {
  const entries = await client.getEntries<ContentfulMapEntry>({
    content_type: 'cityPost',
    order: '-fields.publishedAt',
  });

  return entries.items
    .filter((entry) => {
      // Only include entries that have required fields
      return (
        entry.fields.cityName &&
        entry.fields.coordinates &&
        entry.fields.coordinates.lat &&
        entry.fields.coordinates.lon &&
        entry.fields.mainImage &&
        entry.fields.mainImage.fields &&
        entry.fields.mainImage.fields.file &&
        entry.fields.mainImage.fields.file.url
      );
    })
    .map((entry) => ({
      id: entry.sys.id,
      name: entry.fields.cityName,
      coordinates: {
        latitude: entry.fields.coordinates.lat,
        longitude: entry.fields.coordinates.lon,
      },
      zoom: 13,
      featured: false,
      imageUrl: `https:${entry.fields.mainImage.fields.file.url}`,
      description: entry.fields.description,
      shortDescription: entry.fields.blurb,
      geographicalFeatures: [],
      funFacts: [],
      historicalContext: '',
      tags: entry.fields.tags || [],
      citations: entry.fields.citations || [],
      slug: entry.fields.slug,
      publishedAt: entry.fields.publishedAt,
      // NEW INTERACTIVE MAP FIELDS
      useInteractiveMap: entry.fields.useInteractiveMap || false,
      mapStyle: entry.fields.mapStyle || null,
      initialZoom: entry.fields.initialZoom || 13,
      markers: entry.fields.markers || [],
      geoJsonLayers: entry.fields.geoJsonLayers || [],
      mapSections: entry.fields.mapSections || [],
    }));
}

export async function getMapOfTheDay() {
  const entries = await client.getEntries<ContentfulMapEntry>({
    content_type: 'cityPost',
    order: '-fields.publishedAt',
    limit: 10, // Get more entries to find a valid one
  });

  if (entries.items.length === 0) {
    throw new Error('No maps found');
  }

  // Find the first entry that has all required fields
  for (const entry of entries.items) {
    // Check if entry has required fields
    if (entry.fields.cityName && 
        entry.fields.coordinates && 
        entry.fields.coordinates.lat && 
        entry.fields.coordinates.lon &&
        entry.fields.mainImage?.fields?.file?.url) {
      
      console.log(`✅ Found valid map of the day: ${entry.fields.cityName}`);
      
      return {
        id: entry.sys.id,
        name: entry.fields.cityName,
        coordinates: {
          latitude: entry.fields.coordinates.lat,
          longitude: entry.fields.coordinates.lon,
        },
        zoom: 13,
        featured: true,
        imageUrl: `https:${entry.fields.mainImage.fields.file.url}`,
        description: entry.fields.description,
        shortDescription: entry.fields.blurb,
        geographicalFeatures: [],
        funFacts: [],
        historicalContext: '',
        tags: entry.fields.tags || [],
        citations: entry.fields.citations || [],
        slug: entry.fields.slug,
        publishedAt: entry.fields.publishedAt,
        // NEW INTERACTIVE MAP FIELDS
        useInteractiveMap: entry.fields.useInteractiveMap || false,
        mapStyle: entry.fields.mapStyle || null,
        initialZoom: entry.fields.initialZoom || 13,
        markers: entry.fields.markers || [],
        geoJsonLayers: entry.fields.geoJsonLayers || [],
        mapSections: entry.fields.mapSections || [],
      };
    } else {
      console.log(`❌ Skipping invalid map: ${entry.fields.cityName || 'Unknown'} - missing required fields`);
    }
  }

  throw new Error('No valid maps found with required fields');
}

export async function searchMaps(query: string) {
  const entries = await client.getEntries<ContentfulMapEntry>({
    content_type: 'cityPost',
    query: query,
  });

  return entries.items.map((entry) => ({
    id: entry.sys.id,
    name: entry.fields.cityName,
    coordinates: {
      latitude: entry.fields.coordinates.lat,
      longitude: entry.fields.coordinates.lon,
    },
    zoom: 13,
    featured: false,
    imageUrl: `https:${entry.fields.mainImage.fields.file.url}`,
    description: entry.fields.description as Document,
    shortDescription: entry.fields.blurb,
    geographicalFeatures: [],
    funFacts: [],
    historicalContext: '',
    tags: entry.fields.tags || [],
    citations: entry.fields.citations || [],
    slug: entry.fields.slug,
    publishedAt: entry.fields.publishedAt,
    // NEW INTERACTIVE MAP FIELDS
    useInteractiveMap: entry.fields.useInteractiveMap || false,
    mapStyle: entry.fields.mapStyle || null,
    initialZoom: entry.fields.initialZoom || 13,
    markers: entry.fields.markers || [],
    geoJsonLayers: entry.fields.geoJsonLayers || [],
    mapSections: entry.fields.mapSections || [], // For multiple maps per entry
  }));
}

export async function getImageTags() {
  try {
    const entries = await client.getEntries<ContentfulMapEntry>({
      content_type: 'cityPost',
      select: ['fields.tags', 'fields.mainImage']
    });

    const tagMap = new Map<string, string>();
    
    entries.items.forEach(entry => {
      // Add better safety checks for nested properties
      if (entry?.fields?.tags && 
          entry?.fields?.mainImage?.fields?.file?.url) {
        entry.fields.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, `https:${entry.fields.mainImage.fields.file.url}`);
          }
        });
      }
    });

    return Array.from(tagMap).map(([tag, imageUrl]) => ({
      id: tag,
      tagName: tag,
      imageUrl: imageUrl
    }));
  } catch (error) {
    console.error('Error fetching image tags:', error);
    return [];
  }
}