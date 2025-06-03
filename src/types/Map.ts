import { Document } from '@contentful/rich-text-types';

export interface MapLocation {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  featured: boolean;
  featuredDate?: string;
  imageUrl: string;
  description: Document;
  shortDescription: string;
  geographicalFeatures: string[];
  funFacts: string[];
  historicalContext: string;
  tags: string[];
  citations: string[];
  slug: string;
  publishedAt: string;
}

export interface MapState {
  currentMap: MapLocation | null;
  favoriteMapIds: string[];
  viewedMapIds: string[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  archiveMaps: MapLocation[];
  searchResults?: MapLocation[];
  imageTags: ImageTag[];
}

export interface ContentfulMapEntry {
  sys: {
    id: string;
  };
  fields: {
    cityName: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    mainImage: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    blurb: string;
    description: Document;
    tags: string[];
    citations: string[];
    slug: string;
    publishedAt: string;
  };
}

export interface ContentfulImageTagEntry {
  sys: {
    id: string;
  };
  fields: {
    tagName: string;
    image?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    mainImage?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    imageUrl?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    ImageTagGallery?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
  };
}

export interface ImageTag {
  id: string;
  tagName: string;
  imageUrl: string;
}