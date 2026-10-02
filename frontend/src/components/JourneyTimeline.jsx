import React, { useState } from 'react';

export default function JourneyTimeline({ route, linesLookup }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!route || !route.found) return null;

  const { steps } = route;
  if (!steps || steps.length === 0) return null;

  // Group steps by contiguous transit lines
  const legs = [];
  let currentLeg = {
    line: steps[0].line,
    stations: [steps[0]],
    startStation: steps[0].station,
    transferToNext: null
  };

  for (let i = 1; i < steps.length; i++) {
    const step = steps[i];
    if (step.isTransfer) {
      currentLeg.transferToNext = step;
      legs.push(currentLeg);
      currentLeg = {
        line: step.line,
        stations: [step],
        startStation: step.station,
        transferToNext: null
      };
    } else {
      currentLeg.stations.push(step);
    }
  }
  legs.push(currentLeg);

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="timeline-title-group">
          <h3 className="section-title">Step-by-Step Transit Itinerary</h3>
          <span className="legs-count">{legs.length} {legs.length === 1 ? 'Leg' : 'Legs'}</span>
        </div>
        {steps.length > 8 && (
          <button
            className="expand-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse intermediate stops' : 'Show all stops'}
          </button>
        )}
      </div>

      <div className="legs-wrapper">
        {legs.map((leg, legIdx) => {
          const lineInfo = linesLookup[leg.line] || {
            color: '#0072CE',
            textColor: '#ffffff',
            name: `${leg.line} Line`
          };

          const firstStation = leg.stations[0];
          const lastStation = leg.stations[leg.stations.length - 1];
          const intermediateCount = leg.stations.length - 2;

          return (
            <div key={legIdx} className="transit-leg-block">
              {/* Leg Header Banner */}
              <div
                className="leg-header"
                style={{ borderLeftColor: lineInfo.color }}
              >
                <div
                  className="leg-line-pill"
                  style={{ backgroundColor: lineInfo.color, color: lineInfo.textColor }}
                >
                  <span className="line-indicator-circle"></span>
                  <strong>{lineInfo.name || leg.line}</strong>
                </div>
                <div className="leg-stats">
                  <span>{leg.stations.length - 1} stops</span>
                  <span>•</span>
                  <span>
                    ~{leg.stations.reduce((acc, s) => acc + (s.time || 0), 0)} mins
                  </span>
                </div>
              </div>

              {/* Station List inside Leg */}
              <div className="leg-stations-list" style={{ '--line-color': lineInfo.color }}>
                {/* Boarding Station */}
                <div className="station-node start-node">
                  <div
                    className="station-bullet"
                    style={{ borderColor: lineInfo.color, backgroundColor: lineInfo.color }}
                  ></div>
                  <div className="station-content">
                    <div className="station-name-row">
                      <span className="station-title">{firstStation.station}</span>
                      {legIdx === 0 && <span className="status-tag start-tag">BOARDING</span>}
                    </div>
                    {legIdx === 0 && (
                      <span className="instruction-text">
                        Board {lineInfo.name || leg.line} towards your destination
                      </span>
                    )}
                  </div>
                </div>

                {/* Intermediate Stations */}
                {intermediateCount > 0 && (
                  <>
                    {!isExpanded && intermediateCount > 3 ? (
                      <div
                        className="collapsed-stops-row"
                        onClick={() => setIsExpanded(true)}
                        title="Click to view all stations in between"
                      >
                        <div className="stop-dots">
                          <span></span><span></span><span></span>
                        </div>
                        <span className="collapsed-text">
                          Passes through {intermediateCount} intermediate stations (Click to expand)
                        </span>
                      </div>
                    ) : (
                      leg.stations.slice(1, -1).map((s, idx) => (
                        <div key={idx} className="station-node intermediate-node">
                          <div
                            className="station-bullet intermediate-bullet"
                            style={{ borderColor: lineInfo.color }}
                          ></div>
                          <div className="station-content">
                            <span className="station-title-dim">{s.station}</span>
                            <span className="stop-dist">+{s.dist} km</span>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* Leg Alighting Station */}
                {leg.stations.length > 1 && (
                  <div className="station-node end-node">
                    <div
                      className="station-bullet"
                      style={{ borderColor: lineInfo.color, backgroundColor: '#ffffff' }}
                    ></div>
                    <div className="station-content">
                      <div className="station-name-row">
                        <span className="station-title">{lastStation.station}</span>
                        {legIdx === legs.length - 1 ? (
                          <span className="status-tag finish-tag">DESTINATION</span>
                        ) : (
                          <span className="status-tag transfer-tag">INTERCHANGE</span>
                        )}
                      </div>
                      {legIdx === legs.length - 1 && (
                        <span className="instruction-text finish-text">
                          Alight here. You have reached your destination!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Interchange Banner if transitioning to next line */}
              {leg.transferToNext && (
                <div className="interchange-alert-card">
                  <div className="transfer-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M16 3l4 4-4 4" />
                      <path d="M20 7H4" />
                      <path d="M8 21l-4-4 4-4" />
                      <path d="M4 17h16" />
                    </svg>
                  </div>
                  <div className="transfer-details">
                    <div className="transfer-title-row">
                      <strong>Interchange at {leg.transferToNext.station}</strong>
                      <span className="walk-time-tag">
                        ⏱️ ~{leg.transferToNext.time} min walk
                      </span>
                    </div>
                    <p className="transfer-note">
                      Follow floor signage to switch from{' '}
                      <span className="line-highlight">{leg.transferToNext.prevLine} Line</span> to{' '}
                      <span className="line-highlight">{leg.transferToNext.line} Line</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
