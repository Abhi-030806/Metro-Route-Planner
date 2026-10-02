import React from 'react';

export default function Header({ totalStations, totalLines, onOpenLinesModal }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-logo">
            <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
              <rect width="40" height="40" rx="10" fill="#0072CE" />
              <path
                d="M10 28V12L20 22L30 12V28"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">Delhi Metro Route Planner</h1>
              <span className="brand-version">v2.0 • Live Graph Engine</span>
            </div>
            <p className="brand-subtitle">
              Intelligent transit routing powered by Dijkstra Shortest Path & Trie Autocomplete
            </p>
          </div>
        </div>

        <div className="header-badges">
          <div className="stat-pill" title="Network size">
            <span className="stat-value">{totalStations}</span>
            <span className="stat-label">Stations</span>
          </div>
          <div className="stat-pill" title="Transit lines">
            <span className="stat-value">{totalLines}</span>
            <span className="stat-label">Lines</span>
          </div>
          <div className="stat-pill tech-pill" title="Graph Routing Engine">
            <span className="tech-badge">O((V+E) log V)</span>
            <span className="stat-label">Dijkstra Engine</span>
          </div>
          <div className="stat-pill tech-pill" title="Prefix Autocomplete">
            <span className="tech-badge">O(L)</span>
            <span className="stat-label">Trie Search</span>
          </div>
          <button
            className="explore-lines-btn"
            onClick={onOpenLinesModal}
            title="Browse all 13 metro lines"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Network Lines</span>
          </button>
        </div>
      </div>
    </header>
  );
}
