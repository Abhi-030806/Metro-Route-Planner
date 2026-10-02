import React, { useState } from 'react';

export default function MetroMapVisualizer({ lines, activeRoute, onSelectStation }) {
  const [selectedStationInfo, setSelectedStationInfo] = useState(null);

  const activeStationSet = new Set(activeRoute ? activeRoute.pathStations : []);
  const sourceStation = activeRoute ? activeRoute.source : null;
  const destStation = activeRoute ? activeRoute.destination : null;

  // Collect interchange stations in active route
  const interchangeStations = new Set();
  if (activeRoute && activeRoute.steps) {
    for (const step of activeRoute.steps) {
      if (step.isTransfer) {
        interchangeStations.add(step.station);
      }
    }
  }

  return (
    <div className="metro-visualizer-card">
      <div className="visualizer-header">
        <div className="visualizer-title-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <h3 className="section-title">Transit Network Schematic</h3>
        </div>
        <div className="visualizer-legend">
          <span className="legend-item">
            <span className="legend-dot source-dot"></span> Source
          </span>
          <span className="legend-item">
            <span className="legend-dot dest-dot"></span> Destination
          </span>
          <span className="legend-item">
            <span className="legend-dot transfer-dot"></span> Interchange
          </span>
          <span className="legend-item">
            <span className="legend-dot active-dot"></span> Path Station
          </span>
        </div>
      </div>

      {activeRoute && activeRoute.found && (
        <div className="active-route-banner">
          <div className="banner-left">
            <span className="route-badge">Active Computed Route</span>
            <span className="route-arrow-text">
              <strong>{activeRoute.source}</strong> → <strong>{activeRoute.destination}</strong>
            </span>
          </div>
          <div className="banner-stats">
            <span>{activeRoute.totalTime} mins</span>
            <span>•</span>
            <span>{activeRoute.totalDistance} km</span>
            <span>•</span>
            <span>{activeRoute.interchangeCount} interchange(s)</span>
          </div>
        </div>
      )}

      {/* Network Lines Tracks View */}
      <div className="schematic-tracks-scroll">
        <div className="schematic-tracks-grid">
          {lines.map((line) => {
            const hasActiveStations = line.stations.some((st) => activeStationSet.has(st));

            return (
              <div
                key={line.id}
                className={`line-track-row ${hasActiveStations ? 'has-active-stations' : ''}`}
              >
                <div
                  className="line-track-header"
                  style={{
                    backgroundColor: line.color,
                    color: line.textColor || '#ffffff'
                  }}
                >
                  <span className="line-dot-indicator"></span>
                  <span className="line-name-label">{line.name}</span>
                  <span className="line-station-count">{line.stations.length}</span>
                </div>

                <div className="line-stations-strip">
                  {line.stations.map((stName, idx) => {
                    const isSource = stName === sourceStation;
                    const isDest = stName === destStation;
                    const isTransfer = interchangeStations.has(stName);
                    const isActive = activeStationSet.has(stName);

                    let nodeClass = 'station-chip';
                    if (isSource) nodeClass += ' chip-source';
                    else if (isDest) nodeClass += ' chip-dest';
                    else if (isTransfer) nodeClass += ' chip-transfer';
                    else if (isActive) nodeClass += ' chip-active';

                    return (
                      <React.Fragment key={stName}>
                        <button
                          type="button"
                          className={nodeClass}
                          title={`${stName} (${line.name}) - Click to set as Origin or Destination`}
                          onClick={() => {
                            setSelectedStationInfo({
                              name: stName,
                              line: line.name,
                              color: line.color
                            });
                          }}
                        >
                          <span
                            className="chip-circle"
                            style={{
                              borderColor: line.color,
                              backgroundColor: isActive ? line.color : '#ffffff'
                            }}
                          ></span>
                          <span className="chip-text">{stName}</span>
                        </button>
                        {idx < line.stations.length - 1 && (
                          <div
                            className={`track-segment ${isActive && activeStationSet.has(line.stations[idx + 1]) ? 'track-segment-active' : ''}`}
                            style={{
                              backgroundColor:
                                isActive && activeStationSet.has(line.stations[idx + 1])
                                  ? line.color
                                  : undefined
                            }}
                          ></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedStationInfo && (
        <div className="station-inspector-modal">
          <div className="inspector-content">
            <div className="inspector-header">
              <span
                className="inspector-line-pill"
                style={{ backgroundColor: selectedStationInfo.color, color: '#fff' }}
              >
                {selectedStationInfo.line}
              </span>
              <button
                className="close-inspector-btn"
                onClick={() => setSelectedStationInfo(null)}
              >
                ×
              </button>
            </div>
            <h4 className="inspector-title">{selectedStationInfo.name}</h4>
            <div className="inspector-actions">
              <button
                className="inspector-action-btn btn-source"
                onClick={() => {
                  onSelectStation('source', selectedStationInfo.name);
                  setSelectedStationInfo(null);
                }}
              >
                🟢 Set as Source
              </button>
              <button
                className="inspector-action-btn btn-dest"
                onClick={() => {
                  onSelectStation('destination', selectedStationInfo.name);
                  setSelectedStationInfo(null);
                }}
              >
                🎯 Set as Destination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
