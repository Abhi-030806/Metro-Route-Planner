import React, { useState } from 'react';

export default function LinesDirectoryModal({ lines, isOpen, onClose, onSelectStation }) {
  const [activeLineId, setActiveLineId] = useState(lines[0]?.id || '');
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const activeLine = lines.find((l) => l.id === activeLineId) || lines[0];

  const filteredStations = activeLine
    ? activeLine.stations.filter((s) => s.toLowerCase().includes(filterQuery.toLowerCase()))
    : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="lines-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">Delhi Metro Transit Network Directory</h2>
            <p className="modal-subtitle">
              Explore 250+ stations across all 13 interconnected transit corridors
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body-layout">
          {/* Lines Sidebar */}
          <div className="lines-sidebar">
            <div className="sidebar-label">Select Transit Line ({lines.length})</div>
            <div className="lines-button-list">
              {lines.map((line) => {
                const isCurrent = line.id === activeLineId;
                return (
                  <button
                    key={line.id}
                    className={`line-selector-tab ${isCurrent ? 'active' : ''}`}
                    onClick={() => {
                      setActiveLineId(line.id);
                      setFilterQuery('');
                    }}
                    style={{
                      borderLeftColor: line.color,
                      backgroundColor: isCurrent ? `${line.color}15` : undefined
                    }}
                  >
                    <span
                      className="tab-color-bullet"
                      style={{ backgroundColor: line.color }}
                    ></span>
                    <span className="tab-line-name">{line.name}</span>
                    <span className="tab-count">{line.stations.length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Stations Content */}
          <div className="line-details-pane">
            {activeLine && (
              <>
                <div
                  className="pane-header-banner"
                  style={{
                    backgroundColor: activeLine.color,
                    color: activeLine.textColor || '#ffffff'
                  }}
                >
                  <div className="pane-title-wrap">
                    <h3>{activeLine.name}</h3>
                    <span>{activeLine.stations.length} Total Stations</span>
                  </div>
                  <div className="terminals-info">
                    <span>
                      Terminals: <strong>{activeLine.stations[0]}</strong> ↔{' '}
                      <strong>{activeLine.stations[activeLine.stations.length - 1]}</strong>
                    </span>
                  </div>
                </div>

                <div className="station-search-filter">
                  <input
                    type="text"
                    placeholder={`Filter stations in ${activeLine.name}...`}
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="pane-search-input"
                  />
                  {filterQuery && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setFilterQuery('')}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="stations-grid-list">
                  {filteredStations.map((station, idx) => (
                    <div key={station} className="station-grid-item">
                      <div className="grid-station-idx">{idx + 1}</div>
                      <div className="grid-station-name">{station}</div>
                      <div className="grid-station-buttons">
                        <button
                          className="grid-btn btn-set-source"
                          title="Set as Source"
                          onClick={() => {
                            onSelectStation('source', station);
                            onClose();
                          }}
                        >
                          From
                        </button>
                        <button
                          className="grid-btn btn-set-dest"
                          title="Set as Destination"
                          onClick={() => {
                            onSelectStation('destination', station);
                            onClose();
                          }}
                        >
                          To
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredStations.length === 0 && (
                    <div className="no-filter-results">
                      No station found matching "{filterQuery}" on this line.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
