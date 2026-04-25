import { useState, useEffect, useCallback } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer as LeafletMap, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../store/useStore';

// Inject keyframe for divIcon animations if not using tailwind's animate-ping/pulse inside the icon
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes pinPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.4)}}`;
document.head.appendChild(styleEl);

// ─── Coordinate Helpers ───────────────────────────────────────────────────────
const BOUNDS = { minLat: 18.89, maxLat: 19.30, minLng: 72.77, maxLng: 73.00 };

const projectToSVG = (lat: number, lng: number) => ({
  x: (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng) * 1000,
  y: (BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat) * 1000,
});

const projectFromSVG = (x: number, y: number) => ({
  lat: BOUNDS.maxLat - (y / 1000) * (BOUNDS.maxLat - BOUNDS.minLat),
  lng: (x / 1000) * (BOUNDS.maxLng - BOUNDS.minLng) + BOUNDS.minLng,
});

// ─── Status helpers ───────────────────────────────────────────────────────────
// Using the Material 3 colors from tailwind.config
const STATUS_COLORS: Record<string, { bg: string, ring: string, animation: string }> = {
  New: { bg: '#ba1a1a', ring: '#ba1a1a33', animation: 'animate-ping' }, // error
  'In Progress': { bg: '#4edea3', ring: 'rgba(78, 222, 163, 0.3)', animation: 'animate-pulse' }, // tertiary-fixed-dim
  Resolved: { bg: '#009668', ring: 'rgba(0, 150, 104, 0.2)', animation: '' }, // green
  Draft: { bg: '#000000', ring: '#00000033', animation: 'animate-pulse' }, // primary
};

// ─── Map reset control ────────────────────────────────────────────────────────
const MapControls: React.FC<{ trigger: number }> = ({ trigger }) => {
  const map = useMap();
  useEffect(() => { map.flyTo([19.076, 72.877], 12, { duration: 1.5 }); }, [trigger, map]);
  return (
    <div className="absolute bottom-xl right-xl bg-on-primary border border-outline-variant/50 rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05),0_2px_4px_-2px_rgba(15,23,42,0.03)] flex flex-col p-xs gap-1 pointer-events-auto z-[1000]">
      <button onClick={() => map.zoomIn()} aria-label="Zoom In" className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors flex items-center justify-center">
        <span className="material-symbols-outlined">add</span>
      </button>
      <div className="w-full h-px bg-outline-variant/30 my-xs"></div>
      <button onClick={() => map.zoomOut()} aria-label="Zoom Out" className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors flex items-center justify-center">
        <span className="material-symbols-outlined">remove</span>
      </button>
      <div className="w-full h-px bg-outline-variant/30 my-xs"></div>
      <button aria-label="Map Layers" className="p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors flex items-center justify-center">
        <span className="material-symbols-outlined">layers</span>
      </button>
      <div className="w-full h-px bg-outline-variant/30 my-xs"></div>
      <button onClick={() => map.flyTo([19.076, 72.877], 12, { duration: 1.5 })} aria-label="My Location" className="p-2 text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center">
        <span className="material-symbols-outlined fill">my_location</span>
      </button>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const MapContainer: React.FC = () => {
  const {
    issues, trendingIssues, currentUser, selectedConstituency, setSelectedConstituency,
    createIssue, geoData, fetchGeoData, isLiveMode, mlas, fetchMlas,
  } = useStore();

  const [isReporting, setIsReporting] = useState(false);
  const [reportData, setReportData] = useState<{ lat: number; lng: number; id: string; name: string } | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);


  useEffect(() => { fetchGeoData(); fetchMlas(); }, [fetchGeoData, fetchMlas]);

  // ─── Map event handlers ────────────────────────────────────────────────────
  const onWardClick = useCallback((e: any, feature: any) => {
    if (currentUser?.role === 'ROLE_MLA') return;
    const wardId = feature.properties.Name.toLowerCase().replace(/[/\s]/g, '_');
    setReportData({ lat: e.latlng.lat, lng: e.latlng.lng, id: wardId, name: feature.properties.Name });
    setIsReporting(true);
  }, [currentUser]);

  const wardStyle = useCallback((feature: any) => {
    const wardId = feature?.properties?.Name?.toLowerCase().replace(/[/\s]/g, '_');
    const isSelected = selectedConstituency === wardId;
    const isMLAOwned = currentUser?.role === 'ROLE_MLA' && currentUser.mla_id === wardId;
    return {
      fillColor: isMLAOwned ? '#4edea3' : isSelected ? '#bec6e0' : '#fcf8fa',
      weight: isSelected ? 1.5 : 0.5,
      opacity: 1,
      color: isSelected ? '#1b1b1d' : '#c6c6cd',
      fillOpacity: isMLAOwned ? 0.4 : isSelected ? 0.6 : 0.4,
    };
  }, [selectedConstituency, currentUser]);

  const onEachFeature = useCallback((feature: any, layer: any) => {
    layer.on({
      mouseover: () => {
        const wardId = feature.properties.Name.toLowerCase().replace(/[/\s]/g, '_');
        setSelectedConstituency(wardId);
      },
      mouseout: () => { setSelectedConstituency(null); },
      click: (e: any) => onWardClick(e, feature),
    });
  }, [onWardClick, setSelectedConstituency]);

  // ─── Marker icon ───────────────────────────────────────────────────────────
  const getMarkerIcon = useCallback((status: string, isDraft = false) => {
    const style = STATUS_COLORS[isDraft ? 'Draft' : status] || STATUS_COLORS['Resolved'];
    
    // We render custom HTML with the halo and pin body per the UI spec
    // Note: Leaflet divIcon doesn't play well with complex tailwind classes sometimes if they are not in the main bundle,
    // but standard classes should work. We use inline styles for the dynamic colors.
    let html = '';
    
    if (status === 'New' && isLiveMode) {
      // Critical / Active
      html = `
        <div class="relative flex items-center justify-center group">
          <div class="absolute w-12 h-12 rounded-full animate-ping pointer-events-none" style="background-color: ${style.ring};"></div>
          <div class="absolute w-8 h-8 rounded-full pointer-events-none" style="background-color: ${style.ring}; opacity: 0.5;"></div>
          <div class="relative w-4 h-4 rounded-full shadow-[0_2px_8px_rgba(186,26,26,0.6)] border-2 border-white z-10 transition-transform" style="background-color: ${style.bg};"></div>
        </div>
      `;
    } else if (status === 'In Progress') {
      // Elevated
      html = `
        <div class="relative flex items-center justify-center group">
          ${isLiveMode ? `<div class="absolute w-10 h-10 rounded-full animate-pulse pointer-events-none" style="background-color: ${style.ring};"></div>` : ''}
          <div class="relative w-3 h-3 rounded-full shadow-md border-2 border-white z-10 transition-transform" style="background-color: ${style.bg};"></div>
        </div>
      `;
    } else if (isDraft) {
      html = `
        <div class="relative flex items-center justify-center group">
          <div class="absolute w-12 h-12 rounded-full animate-ping pointer-events-none" style="background-color: ${style.ring};"></div>
          <div class="relative w-4 h-4 rounded-full shadow-xl border-2 border-white z-10 transition-transform" style="background-color: ${style.bg};"></div>
        </div>
      `;
    } else {
      // Monitoring / Resolved
      html = `
        <div class="relative flex items-center justify-center group">
          <div class="relative w-3 h-3 rounded-full shadow-sm border-2 border-white z-10 transition-transform" style="background-color: ${style.bg};"></div>
        </div>
      `;
    }

    return L.divIcon({
      className: '',
      html,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }, [isLiveMode]);

  // ─── Form submit ───────────────────────────────────────────────────────────
  const submitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData) return;
    setSubmitting(true);
    const { x, y } = projectToSVG(reportData.lat, reportData.lng);
    const success = await createIssue({ title, category: category.toUpperCase(), description, x_coord: x, y_coord: y, constituency_id: reportData.id });
    if (success) {
      setIsReporting(false);
      setTitle(''); setDescription(''); setReportData(null);
    }
    setSubmitting(false);
  };

  const getWardMLA = (wardId: string) => mlas.find(m => m.id === wardId);

  if (!geoData) return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
        <p className="font-caption text-caption text-secondary">Loading Civic Map...</p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      
      {/* ── Live Activity Feed (Right Side) ────────────────────────────────── */}
      <AnimatePresence>
        {isLiveMode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-md right-md w-80 bg-surface/40 backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-lg p-md z-[1000] flex flex-col gap-sm max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-xs">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              <h2 className="font-h2 text-h2 text-on-surface text-[16px]">Live City Pulse</h2>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide pr-1">
              <AnimatePresence initial={false}>
                {issues.slice(0, 5).map((issue, idx) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24, delay: idx * 0.1 }}
                    className="p-3 bg-surface/60 rounded-xl border border-outline-variant/20 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-caps text-label-caps text-primary uppercase">{issue.category}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(issue.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="font-body-md text-sm text-on-surface leading-tight">{issue.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-1">{issue.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dimming Overlay when reporting ─────────────────────────────────── */}
      <div className={`absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px] z-[400] transition-opacity duration-500 pointer-events-none ${isReporting ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* ── Trending Issues Left Panel ─────────────────────────────────────── */}
      <div className="absolute top-md left-md w-80 bg-surface/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-lg p-md z-[1000] flex flex-col gap-sm">
        <div className="flex items-center justify-between mb-xs">
          <h2 className="font-h2 text-h2 text-on-surface text-[18px]">Trending Issues</h2>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">filter_list</span>
        </div>

        {trendingIssues.length === 0 ? (
          <p className="text-xs text-on-surface-variant p-4 text-center italic">No trending issues currently.</p>
        ) : (
          trendingIssues.map((issue) => (
            <div key={issue.id} className="p-md bg-on-primary/60 rounded-lg border border-outline-variant/10 hover:bg-surface-variant transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-sm">
                <div className={`flex items-center gap-sm ${issue.upvotes > 10 ? 'text-error' : 'text-primary'}`}>
                  <span className="material-symbols-outlined text-[20px] fill">{issue.upvotes > 10 ? 'warning' : 'trending_up'}</span>
                  <span className="font-label-caps text-label-caps uppercase">{issue.upvotes > 10 ? 'Critical' : 'Trending'}</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">
                  {Math.floor((Date.now() - new Date(issue.created_at).getTime()) / 3600000)}h ago
                </span>
              </div>
              <h3 className="font-body-md text-body-md font-semibold text-on-surface mb-xs">{issue.title}</h3>
              <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {issue.constituency_id}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ── Leaflet Map ───────────────────────────────────────────────────── */}
      <LeafletMap
        center={[19.076, 72.877]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
        style={{ background: '#e0e3e5' }}
      >
        <MapControls trigger={0} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
          maxZoom={19}
        />

        <GeoJSON
          key={selectedConstituency || 'default'}
          data={geoData}
          style={wardStyle}
          onEachFeature={onEachFeature}
        />

        {/* @ts-ignore */}
        <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
          {issues.map((issue) => {
            const { lat, lng } = projectFromSVG(issue.x_coord, issue.y_coord);
            return (
              <Marker key={issue.id} position={[lat, lng]} icon={getMarkerIcon(issue.status)}>
                <Popup className="custom-popup" maxWidth={280}>
                  <div className="p-1 font-body-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">{issue.category}</span>
                      <span className="font-label-caps text-label-caps font-bold px-2 py-0.5 rounded border border-outline-variant/50">
                        {issue.status}
                      </span>
                    </div>
                    <h4 className="font-h2 text-[16px] text-on-surface mb-1 leading-tight">{issue.title}</h4>
                    <p className="font-caption text-caption text-on-surface-variant leading-snug mb-3">{issue.description}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
                      <span className="text-[10px] font-mono text-outline">#{issue.reporter_hash}</span>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                        <span className="font-caption text-caption font-bold">{issue.upvotes}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {reportData && isReporting && (
          <Marker position={[reportData.lat, reportData.lng]} icon={getMarkerIcon('Draft', true)} />
        )}
      </LeafletMap>

      {/* ── Report & Suggest Flow Side Drawer ──────────────────────────────── */}
      <aside className={`absolute right-0 top-0 bottom-0 w-[480px] bg-surface-bright/95 backdrop-blur-xl border-l border-outline-variant shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] z-[1001] flex flex-col transform transition-transform duration-500 ease-out ${isReporting ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="px-xl py-lg flex items-center justify-between border-b border-surface-variant">
          <h2 className="font-h2 text-h2 text-on-surface">Report an Issue</h2>
          <button onClick={() => setIsReporting(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-grow overflow-y-auto px-xl py-lg flex flex-col gap-y-xl">
          
          {/* Location Summary Card */}
          {reportData && (
            <div className="bg-surface rounded-xl border border-outline-variant p-md flex items-start gap-x-md shadow-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-1">
                <span className="material-symbols-outlined">my_location</span>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Selected Location</p>
                <p className="font-body-md text-body-md text-on-surface font-medium">{reportData.name}</p>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  Lat: {reportData.lat.toFixed(4)}, Lng: {reportData.lng.toFixed(4)}
                </p>
                {getWardMLA(reportData.id) && (
                  <p className="text-[10pt] text-primary mt-1">
                    MLA: {getWardMLA(reportData.id)?.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Category Selection (Bento Grid) */}
          <div>
            <h3 className="font-h2 text-h2 text-on-surface mb-md text-[18px]">Category</h3>
            <div className="grid grid-cols-2 gap-sm">
              {[
                { id: 'Infrastructure', icon: 'add_road' },
                { id: 'Sanitation', icon: 'delete' },
                { id: 'Parks & Rec', icon: 'park' },
                { id: 'Traffic & Signs', icon: 'traffic' },
              ].map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button 
                    key={cat.id} 
                    onClick={() => setCategory(cat.id)}
                    type="button"
                    className={`bg-surface border p-md rounded-xl flex flex-col items-start gap-y-sm transition-all text-left group ${
                      isSelected ? 'border-primary shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]' : 'border-outline-variant hover:border-outline'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-container-high group-hover:bg-surface-variant text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                    <span className={`font-caption text-caption transition-colors ${
                      isSelected ? 'text-on-surface font-semibold' : 'text-on-surface-variant group-hover:text-on-surface font-medium'
                    }`}>{cat.id}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Details Input */}
          <div className="flex flex-col gap-y-md">
            <h3 className="font-h2 text-h2 text-on-surface text-[18px]">Details</h3>
            <input 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-xl p-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-1 focus:border-primary transition-colors shadow-sm"
              placeholder="Issue title..."
              required
            />
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-xl p-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-1 focus:border-primary transition-colors resize-none shadow-sm" 
              placeholder="Describe the issue specifically..." 
              rows={4}
              required
            ></textarea>
            
            {/* Photo Upload Target */}
            <div className="w-full border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center gap-y-sm bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors shadow-sm">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant text-center">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop<br />
                <span className="text-[12px] opacity-70">PNG, JPG, HEIC up to 10MB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Footer (Actions) */}
        <div className="px-xl py-lg border-t border-surface-variant bg-surface-bright mt-auto flex items-center justify-end gap-x-md">
          <button type="button" onClick={() => setIsReporting(false)} className="font-caption text-caption text-on-surface-variant hover:text-on-surface px-lg py-3 rounded-lg border border-transparent hover:border-outline-variant transition-all">
            Cancel
          </button>
          <button 
            type="button"
            onClick={submitIssue}
            disabled={submitting || !title || !description}
            className="font-caption text-caption text-on-primary bg-primary px-lg py-3 rounded-lg hover:opacity-90 shadow-sm transition-opacity flex items-center gap-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
            {!submitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </div>
      </aside>

    </div>
  );
};
