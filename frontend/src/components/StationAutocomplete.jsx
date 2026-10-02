import React, { useState, useEffect, useRef } from 'react';

export default function StationAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  trie,
  linesLookup,
  iconType = 'source'
}) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle Trie prefix search
  useEffect(() => {
    if (!trie || !query.trim()) {
      setSuggestions([]);
      return;
    }

    if (isOpen) {
      const results = trie.getSuggestions(query, 8);
      setSuggestions(results);
      setHighlightedIndex(-1);
    }
  }, [query, trie, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelectStation = (stationName) => {
    setQuery(stationName);
    onChange(stationName);
    onSelect(stationName);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectStation(suggestions[highlightedIndex].name);
      } else if (suggestions.length > 0) {
        handleSelectStation(suggestions[0].name);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <label className="input-label">
        <span className={`label-dot ${iconType}`}></span>
        {label}
      </label>

      <div className="input-field-container">
        <div className="input-icon">
          {iconType === 'source' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" fill="#10b981" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#ef4444" />
            </svg>
          )}
        </div>

        <input
          type="text"
          className="station-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <button
            type="button"
            className="clear-input-btn"
            onClick={handleClear}
            title="Clear"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="suggestions-dropdown" role="listbox">
          <div className="dropdown-header">
            <span>Trie Autocomplete Suggestions (O(L))</span>
            <span>{suggestions.length} matches</span>
          </div>
          {suggestions.map((item, idx) => (
            <li
              key={item.name}
              role="option"
              aria-selected={idx === highlightedIndex}
              className={`suggestion-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => handleSelectStation(item.name)}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              <div className="station-row">
                <span className="station-name-text">
                  <HighlightMatch text={item.name} query={query} />
                </span>
                <div className="line-badges">
                  {item.lines && item.lines.map((ln) => {
                    const lineInfo = linesLookup[ln];
                    const color = lineInfo ? lineInfo.color : '#4b5563';
                    const textColor = lineInfo ? lineInfo.textColor : '#ffffff';
                    return (
                      <span
                        key={ln}
                        className="micro-badge"
                        style={{ backgroundColor: color, color: textColor }}
                      >
                        {ln}
                      </span>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim().length > 1 && suggestions.length === 0 && (
        <div className="suggestions-dropdown no-results">
          <p>No stations found matching "<strong>{query}</strong>"</p>
          <small>Check spelling or try a line hub (e.g. Rajiv Chowk, Kashmere Gate)</small>
        </div>
      )}
    </div>
  );
}

function HighlightMatch({ text, query }) {
  if (!query) return text;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);

  return (
    <>
      {before}
      <mark className="match-highlight">{match}</mark>
      {after}
    </>
  );
}
