// src/screens/MapScreen.tsx
import React, { useEffect, useState } from 'react'
import ReactMapGL, { Marker, Popup, ViewState } from 'react-map-gl'
import { createClient, Entry } from 'contentful'

// ——— Define the shape of your Contentful entries ———
interface MapLocationFields {
  cityName: string
  coordinates: { lat: number; lon: number }
  publishedAt: string
}

type MapLocation = Entry<MapLocationFields>

// ——— Instantiate Contentful client ———
const contentfulClient = createClient({
  space: process.env.qdezmj7bsmhe!,
  accessToken: process.env.spMXcZwOzzn78kMHfOLS718MB1E0JJKfFMQuZYQfDKc!,
})

export default function MapScreen() {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [viewport, setViewport] = useState<ViewState>({
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 3,
    width: '100%',
    height: '100vh',
  })
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)

  // ——— Fetch your mapLocation entries on mount ———
  useEffect(() => {
    contentfulClient
      .getEntries<MapLocationFields>({ content_type: 'mapLocation', order: '-fields.publishedAt' })
      .then((res) => setLocations(res.items))
      .catch((err) => console.error('Contentful error:', err))
  }, [])

  if (!locations.length) {
    return <div style={{ padding: '2rem' }}>Loading map data…</div>
  }

  // ——— Compute “first” and check if it’s today ———
  const first = locations[0]
  const publishedDate = new Date(first.fields.publishedAt)
  const isToday = publishedDate.toDateString() === new Date().toDateString()

  return (
    <div>
      {/* ——— Header ——— */}
      <h1 style={{ margin: '1rem', fontSize: '1.75rem' }}>
        {isToday ? "Today's map" : publishedDate.toLocaleDateString()}
      </h1>

      {/* ——— Interactive Map ——— */}
      <ReactMapGL
        {...viewport}
        mapLib={import('maplibre-gl')}
        mapStyle="https://demotiles.maplibre.org/style.json"
        onViewportChange={(next) => setViewport(next)}
      >
        {locations.map((loc) => {
          const { lat, lon } = loc.fields.coordinates
          return (
            <Marker key={loc.sys.id} latitude={lat} longitude={lon}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedLocation(loc)}
              >
                <span style={{ fontSize: '24px' }}>📍</span>
              </button>
            </Marker>
          )
        })}

        {selectedLocation && (
          <Popup
            latitude={selectedLocation.fields.coordinates.lat}
            longitude={selectedLocation.fields.coordinates.lon}
            onClose={() => setSelectedLocation(null)}
            closeOnClick={false}
            anchor="top"
          >
            <div style={{ minWidth: '120px' }}>
              <strong>{selectedLocation.fields.cityName}</strong>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                {new Date(selectedLocation.fields.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </div>
  )
}
