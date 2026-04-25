import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, GeoJSON, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

// Mock bounds for Mumbai to project 0-1000 coordinates
const BOUNDS = {
  minLat: 18.89,
  maxLat: 19.30,
  minLng: 72.77,
  maxLng: 73.00
};

const projectToSVG = (lat: number, lng: number) => {
  const x = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng) * 1000;
  const y = (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat) * 1000;
  return { x, y };
};

const projectFromSVG = (x: number, y: number) => {
  const lng = (x / 1000) * (BOUNDS.maxLng - BOUNDS.minLng) + BOUNDS.minLng;
  const lat = BOUNDS.maxLat - (y / 1000) * (BOUNDS.maxLat - BOUNDS.minLat);
  return { lat, lng };
};

export const MapContainer: React.FC = () => {
  const { issues, currentUser, selectedConstituency, setSelectedConstituency, createIssue, geoData, fetchGeoData } = useStore();
  
  const [isReporting, setIsReporting] = useState(false);
  const [reportData, setReportData] = useState<{ lat: number, lng: number, id: string, name: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('INFRASTRUCTURE');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchGeoData();
  }, [fetchGeoData]);

  const onWardClick = (e: any, feature: any) => {
    if (currentUser?.role === 'ROLE_MLA') return;
    
    const wardId = feature.properties.Name.toLowerCase().replace(/[\/\s]/g, '_');
    const wardName = feature.properties.Name;
    
    setReportData({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      id: wardId,
      name: wardName
    });
    setIsReporting(true);
  };

  const submitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData) return;
    
    // Project to 0-1000 space for storage as requested in PRD
    const { x, y } = projectToSVG(reportData.lat, reportData.lng);
    
    const success = await createIssue({
      title,
      category,
      description,
      x_coord: x,
      y_coord: y,
      constituency_id: reportData.id
    });

    if (success) {
      setIsReporting(false);
      setTitle('');
      setDescription('');
      setReportData(null);
    }
  };

  const wardStyle = (feature: any) => {
    const wardId = feature?.properties?.Name?.toLowerCase().replace(/[\/\s]/g, '_');
    const isSelected = selectedConstituency === wardId;
    const isMLAOwned = currentUser?.role === 'ROLE_MLA' && currentUser.mla_id === wardId;

    return {
      fillColor: isSelected ? '#E8E8ED' : '#F5F5F7',
      weight: 0.5,
      opacity: 1,
      color: '#D1D1D6',
      fillOpacity: isMLAOwned ? 1 : (isSelected ? 0.8 : 0.6)
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: () => {
        const wardId = feature.properties.Name.toLowerCase().replace(/[\/\s]/g, '_');
        setSelectedConstituency(wardId);
      },
      mouseout: () => {
        setSelectedConstituency(null);
      },
      click: (e: any) => onWardClick(e, feature)
    });
  };

  const getMarkerIcon = (status: string, isDraft = false) => {
    const color = isDraft ? '#8E8E93' : (status === 'New' ? '#323232' : status === 'In Progress' ? '#D97706' : '#059669');
    return L.divIcon({
      className: 'custom-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-4 h-4 rounded-full bg-white shadow-sm"></div>
          <div class="absolute w-2.5 h-2.5 rounded-full ${!isDraft ? 'pin-pulse' : ''}" style="background-color: ${color}"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  if (!geoData) return (
    <div className="w-full h-full flex items-center justify-center bg-apple-bg text-apple-secondary font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-apple-secondary/20 border-t-apple-secondary rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-tight">Initializing Civic Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full bg-apple-bg overflow-hidden">
      <LeafletMap
        center={[19.0760, 72.8777]}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full bg-transparent"
        zoomControl={false}
      >
        {/* Remove standard tile layer for a "Cartographic" SVG look */}
        <GeoJSON 
          data={geoData} 
          style={wardStyle}
          onEachFeature={onEachFeature}
        />

        {issues.map(issue => {
          // Re-project from 0-1000 space back to LatLng for Leaflet display
          const { lat, lng } = projectFromSVG(issue.x_coord, issue.y_coord);
          return (
            <Marker 
              key={issue.id} 
              position={[lat, lng]} 
              icon={getMarkerIcon(issue.status)}
            >
              <Popup className="apple-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9pt] font-bold text-apple-secondary uppercase tracking-wider">{issue.category}</span>
                    <span className={`text-[8pt] font-semibold px-2 py-0.5 rounded-full ${
                      issue.status === 'New' ? 'bg-apple-new/10 text-apple-new' :
                      issue.status === 'In Progress' ? 'bg-apple-progress/10 text-apple-progress' :
                      'bg-apple-resolved/10 text-apple-resolved'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <h4 className="text-[12pt] font-semibold text-apple-text mb-1">{issue.title}</h4>
                  <p className="text-[10pt] text-apple-secondary leading-tight mb-3">{issue.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-apple-border">
                    <span className="text-[9pt] font-mono text-apple-secondary">Hash: {issue.reporter_hash}</span>
                    <span className="text-[9pt] font-medium text-apple-text">↑ {issue.upvotes}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {reportData && isReporting && (
          <Marker position={[reportData.lat, reportData.lng]} icon={getMarkerIcon('Draft', true)} />
        )}
      </LeafletMap>

      {/* Floating Tooltip Follower */}
      <AnimatePresence>
        {selectedConstituency && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 glass rounded-full flex items-center gap-4 pointer-events-none"
          >
            <div className="flex flex-col">
              <span className="text-[10pt] font-medium text-apple-text">
                {geoData.features.find((f: any) => f.properties.Name.toLowerCase().replace(/[\/\s]/g, '_') === selectedConstituency)?.properties.Name}
              </span>
              <span className="text-[8pt] text-apple-secondary uppercase tracking-widest font-bold">Active Jurisdiction</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReporting && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 w-[400px] h-full bg-apple-surface shadow-2xl z-[1001] border-l border-apple-border flex flex-col"
          >
            <div className="p-8 border-b border-apple-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-apple-text">Report Issue</h2>
                <button onClick={() => setIsReporting(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-apple-bg transition-colors">✕</button>
              </div>
              <div className="p-4 bg-apple-bg rounded-2xl border border-apple-border">
                <p className="text-xs font-bold text-apple-secondary uppercase tracking-widest mb-1">Region Detected</p>
                <p className="text-sm font-medium text-apple-text">{reportData?.name}</p>
              </div>
            </div>
            
            <form onSubmit={submitIssue} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                {['INFRASTRUCTURE', 'SANITATION', 'SAFETY', 'GREENERY'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-4 rounded-2xl border text-xs font-bold tracking-wider transition-all ${category === cat ? 'bg-apple-text text-apple-surface border-apple-text shadow-lg' : 'bg-apple-bg text-apple-secondary border-apple-border hover:border-apple-text/30'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-apple-secondary uppercase tracking-widest ml-1">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-apple-bg border border-apple-border rounded-2xl text-sm focus:outline-none focus:border-apple-text transition-all" placeholder="E.g., Pothole near station" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-apple-secondary uppercase tracking-widest ml-1">Details</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full p-4 bg-apple-bg border border-apple-border rounded-2xl text-sm focus:outline-none focus:border-apple-text transition-all resize-none" placeholder="Please provide exact details..." />
              </div>

              <button type="submit" className="mt-auto w-full py-5 bg-apple-text text-apple-surface rounded-2xl font-semibold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Dispatch Report
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
