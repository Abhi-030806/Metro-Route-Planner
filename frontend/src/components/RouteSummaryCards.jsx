import React from 'react';

function calculateFare(distanceKm) {
  if (distanceKm <= 2) return 10;
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 12) return 30;
  if (distanceKm <= 21) return 40;
  if (distanceKm <= 32) return 50;
  return 60;
}

export default function RouteSummaryCards({ route }) {
  if (!route || !route.found) return null;

  const fare = calculateFare(route.totalDistance);
  const discountedFare = Math.round(fare * 0.9);

  return (
    <div className="summary-cards-grid">
      <div className="kpi-card time-card">
        <div className="kpi-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-label">Estimated Time</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{route.totalTime}</span>
            <span className="kpi-unit">mins</span>
          </div>
          <span className="kpi-subtext">Includes transit & transfer walk</span>
        </div>
      </div>

      <div className="kpi-card distance-card">
        <div className="kpi-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-label">Distance</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{route.totalDistance}</span>
            <span className="kpi-unit">km</span>
          </div>
          <span className="kpi-subtext">Physical track distance</span>
        </div>
      </div>

      <div className="kpi-card interchange-card">
        <div className="kpi-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-label">Interchanges</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{route.interchangeCount}</span>
            <span className="kpi-unit">{route.interchangeCount === 1 ? 'switch' : 'switches'}</span>
          </div>
          <span className="kpi-subtext">
            {route.interchangeCount === 0 ? 'Direct continuous line' : 'Line interchange required'}
          </span>
        </div>
      </div>

      <div className="kpi-card stations-card">
        <div className="kpi-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="3" width="16" height="16" rx="2" />
            <path d="M4 11h16" />
            <path d="M12 3v8" />
            <path d="M8 19l-2 3" />
            <path d="M16 19l2 3" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-label">Stations</span>
          <div className="kpi-value-row">
            <span className="kpi-value">{route.stationCount}</span>
            <span className="kpi-unit">stops</span>
          </div>
          <span className="kpi-subtext">
            ₹{fare} normal fare (₹{discountedFare} Smart Card)
          </span>
        </div>
      </div>
    </div>
  );
}
