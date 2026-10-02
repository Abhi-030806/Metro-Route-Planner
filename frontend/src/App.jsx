import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StationAutocomplete from './components/StationAutocomplete';
import RouteSummaryCards from './components/RouteSummaryCards';
import JourneyTimeline from './components/JourneyTimeline';
import MetroMapVisualizer from './components/MetroMapVisualizer';
import LinesDirectoryModal from './components/LinesDirectoryModal';
import { StationTrie } from './utils/trie';
import { computeDijkstraRoute } from './utils/dijkstra';
import metroData from './data/metroData.json';

const POPULAR_ROUTES = [
  { from: 'Kashmere Gate', to: 'Botanical Garden', label: 'Kashmere Gate ➔ Botanical Garden' },
  { from: 'Rajiv Chowk', to: 'Hauz Khas', label: 'Rajiv Chowk ➔ Hauz Khas' },
  { from: 'New Delhi', to: 'Dwarka Sector 21', label: 'New Delhi ➔ Dwarka Sec 21' },
  { from: 'Inderlok', to: 'Lajpat Nagar', label: 'Inderlok ➔ Lajpat Nagar' },
  { from: 'Dwarka Sector 21', to: 'Noida Sector 52', label: 'Dwarka Sec 21 ➔ Noida Sec 52' }
];

export default function App() {
  const [source, setSource] = useState('Kashmere Gate');
  const [destination, setDestination] = useState('Botanical Garden');
  const [routingMode, setRoutingMode] = useState('fastest');
  const [isLinesModalOpen, setIsLinesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'schematic'

  // Initialize Trie
  const { trie, linesLookup } = useMemo(() => {
    const t = new StationTrie();
    const lookup = {};

    for (const line of metroData.lines) {
      lookup[line.id] = line;
      lookup[line.name] = line;
      for (const st of line.stations) {
        t.insert(st, line.name);
      }
    }

    return { trie: t, linesLookup: lookup };
  }, []);

  // Compute Route using O((V + E) log V) Dijkstra Engine
  const computedRoute = useMemo(() => {
    if (!source || !destination) return null;
    return computeDijkstraRoute(metroData, source, destination, routingMode);
  }, [source, destination, routingMode]);

  // Handle station selection from child components
  const handleSelectStation = (type, stationName) => {
    if (type === 'source') {
      setSource(stationName);
    } else {
      setDestination(stationName);
    }
  };

  // Swap source and destination
  const handleSwapStations = () => {
    setSource(destination);
    setDestination(source);
  };

  return (
    <div className="metro-app-root">
      <Header
        totalStations={metroData.stations.length}
        totalLines={metroData.lines.length}
        onOpenLinesModal={() => setIsLinesModalOpen(true)}
      />

      <main className="main-content-layout">
        {/* Route Planner Control Panel */}
        <section className="planner-control-card">
          <div className="control-header">
            <div className="badge-tag">ROUTE ENGINE</div>
            <h2 className="control-title">Plan Your Transit Journey</h2>
            <p className="control-desc">
              Select origin and destination to compute optimal shortest path, transfer timings, and line interchanges.
            </p>
          </div>

          <div className="route-inputs-container">
            <div className="inputs-column">
              <StationAutocomplete
                label="Origin Station"
                value={source}
                onChange={setSource}
                onSelect={(val) => setSource(val)}
                placeholder="Search starting station..."
                trie={trie}
                linesLookup={linesLookup}
                iconType="source"
              />

              <div className="swap-button-row">
                <button
                  type="button"
                  className="swap-stations-btn"
                  onClick={handleSwapStations}
                  title="Swap Origin and Destination"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
                  </svg>
                  <span>Swap</span>
                </button>
              </div>

              <StationAutocomplete
                label="Destination Station"
                value={destination}
                onChange={setDestination}
                onSelect={(val) => setDestination(val)}
                placeholder="Search destination station..."
                trie={trie}
                linesLookup={linesLookup}
                iconType="destination"
              />
            </div>

            {/* Routing Preferences Mode */}
            <div className="routing-modes-panel">
              <label className="mode-panel-label">Route Optimization Criteria</label>
              <div className="modes-pill-group">
                <button
                  type="button"
                  className={`mode-btn ${routingMode === 'fastest' ? 'active' : ''}`}
                  onClick={() => setRoutingMode('fastest')}
                >
                  <span className="mode-icon">⚡</span>
                  <div className="mode-text">
                    <strong>Fastest Time</strong>
                    <small>Minimizes transit & interchange minutes</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`mode-btn ${routingMode === 'distance' ? 'active' : ''}`}
                  onClick={() => setRoutingMode('distance')}
                >
                  <span className="mode-icon">📏</span>
                  <div className="mode-text">
                    <strong>Shortest Distance</strong>
                    <small>Computes minimum physical track km</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`mode-btn ${routingMode === 'fewest_interchanges' ? 'active' : ''}`}
                  onClick={() => setRoutingMode('fewest_interchanges')}
                >
                  <span className="mode-icon">🔄</span>
                  <div className="mode-text">
                    <strong>Fewest Interchanges</strong>
                    <small>Prioritizes continuous line travel</small>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Popular Routes */}
          <div className="popular-routes-bar">
            <span className="popular-label">Popular Hubs:</span>
            <div className="popular-chips">
              {POPULAR_ROUTES.map((route, i) => (
                <button
                  key={i}
                  className="quick-route-chip"
                  onClick={() => {
                    setSource(route.from);
                    setDestination(route.to);
                  }}
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results & Visualizer Section */}
        {computedRoute && computedRoute.found ? (
          <section className="results-display-section">
            <RouteSummaryCards route={computedRoute} />

            <div className="view-toggle-bar">
              <div className="tabs-wrap">
                <button
                  className={`view-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('itinerary')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <span>Transit Itinerary</span>
                </button>
                <button
                  className={`view-tab-btn ${activeTab === 'schematic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schematic')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>Network Schematic</span>
                </button>
              </div>

              <span className="route-path-summary">
                Path: {computedRoute.steps.length} nodes computed in O((V + E) log V)
              </span>
            </div>

            <div className="tab-view-content">
              {activeTab === 'itinerary' ? (
                <div className="itinerary-schematic-split">
                  <JourneyTimeline route={computedRoute} linesLookup={linesLookup} />
                  <MetroMapVisualizer
                    lines={metroData.lines}
                    activeRoute={computedRoute}
                    onSelectStation={handleSelectStation}
                  />
                </div>
              ) : (
                <MetroMapVisualizer
                  lines={metroData.lines}
                  activeRoute={computedRoute}
                  onSelectStation={handleSelectStation}
                />
              )}
            </div>
          </section>
        ) : (
          <section className="empty-state-card">
            <div className="empty-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3>Select Source & Destination</h3>
            <p>
              Type in the search inputs above or pick from popular hubs to calculate shortest paths,
              transfer times, and line interchange instructions.
            </p>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Delhi Metro Route Planner</strong> • Built with React, C++ STL, Dijkstra & Trie Algorithms.
          </p>
          <p className="footer-sub">
            Real-world dataset spanning 250+ stations across 13 transit lines and 30 interchange hubs.
          </p>
        </div>
      </footer>

      <LinesDirectoryModal
        lines={metroData.lines}
        isOpen={isLinesModalOpen}
        onClose={() => setIsLinesModalOpen(false)}
        onSelectStation={handleSelectStation}
      />
    </div>
  );
}
