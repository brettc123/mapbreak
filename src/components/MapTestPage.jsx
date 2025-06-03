// src/components/MapTestPage.jsx
import React from 'react';
import SimpleMapTest from './SimpleMapTest';

function MapTestPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Map Testing Page</h1>
      <div className="mb-8">
        <SimpleMapTest />
      </div>
    </div>
  );
}

export default MapTestPage;