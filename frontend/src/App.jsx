import React, { useState, useMemo } from 'react';
import metroData from './data/metroData.json';
import './App.css';

// Line colors lookup for Delhi Metro
const LINE_COLORS = {
  'Yellow': '#FFCC00',
  'Blue': '#0072CE',
  'Blue_Vaishali': '#0099FF',
  'Red': '#E31B23',
  'Green': '#00A859',
  'Green_Branch': '#2E7D32',
  'Violet': '#8A2BE2',
  'Pink': '#FF69B4',
  'Magenta': '#D81B60',
  'Rapid Metro': '#00A88F',
  'Airport Express': '#FF8200',
  'Aqua': '#00CED1',
  'Grey': '#808080'
};

// ----------------- TRIE PREFIX SEARCH -----------------
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.originalWord = '';
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }
    node.isEnd = true;
    node.originalWord = word;
  }

  getSuggestions(prefix, limit = 8) {
    if (!prefix || !prefix.trim()) return [];
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      if (!node.children[ch]) {
        // Fallback: substring match if prefix has no direct match
        return metroData.stations
          .filter(s => s.toLowerCase().includes(prefix.toLowerCase()))
          .slice(0, limit);
      }
      node = node.children[ch];
    }

    const ans = [];
    const dfs = (curr) => {
      if (!curr || ans.length >= limit) return;
      if (curr.isEnd) ans.push(curr.originalWord);
      for (const key of Object.keys(curr.children).sort()) {
        dfs(curr.children[key]);
      }
    };
    dfs(node);
    return ans;
  }
}

// ----------------- DIJKSTRA ROUTING ENGINE -----------------
// Supports 3 types of paths:
// 1. 'fastest'      : a = 1.0, b = 0.0, c = 10.0 (Min Time)
// 2. 'interchange'  : a = 0.1, b = 0.0, c = 1000.0 (Fewest Interchanges)
// 3. 'distance'     : a = 0.0, b = 1.0, c = 0.5 (Smallest Distance)
function runDijkstra(station1, station2, routeType = 'fastest') {
  const { nodes, adjacency, stationToNodes } = metroData;

  const srcNodeIds = stationToNodes[station1];
  const destNodeIds = stationToNodes[station2];

  if (!srcNodeIds || !destNodeIds) return null;

  // Set weights according to selected route type
  let a = 1.0, b = 0.0, c = 10.0;
  if (routeType === 'interchange') {
    a = 0.1; b = 0.0; c = 1000.0;
  } else if (routeType === 'distance') {
    a = 0.0; b = 1.0; c = 0.5;
  }

  let bestCost = Infinity;
  let bestPath = null;

  for (const src of srcNodeIds) {
    for (const dest of destNodeIds) {
      const n = nodes.length;
      const dist = new Array(n).fill(Infinity);
      const parent = new Array(n).fill(-1);
      const visited = new Array(n).fill(false);

      dist[src] = 0;

      for (let count = 0; count < n; count++) {
        let u = -1;
        let minD = Infinity;

        for (let i = 0; i < n; i++) {
          if (!visited[i] && dist[i] < minD) {
            minD = dist[i];
            u = i;
          }
        }

        if (u === -1 || u === dest) break;
        visited[u] = true;

        const edges = adjacency[u] || [];
        for (const e of edges) {
          const v = e.to;
          const wt = a * e.time + b * e.dist + c * (e.isTransfer ? 1.0 : 0.0);
          if (dist[u] + wt < dist[v]) {
            dist[v] = dist[u] + wt;
            parent[v] = u;
          }
        }
      }

      if (dist[dest] < bestCost) {
        bestCost = dist[dest];
        const path = [];
        for (let cur = dest; cur !== -1; cur = parent[cur]) {
          path.push(cur);
        }
        path.reverse();
        bestPath = path;
      }
    }
  }

  if (!bestPath || bestPath.length === 0) return null;

  // Build route details matching getPath in C++
  const routeNodes = bestPath.map(id => nodes[id]);
  const steps = [];
  let interchange = 0;
  let totalTime = 0;
  let totalDist = 0;

  for (let i = 0; i < routeNodes.length; i++) {
    const curr = routeNodes[i];
    const isChange = (i + 1 < routeNodes.length && curr.line !== routeNodes[i + 1].line);

    if (i + 1 < routeNodes.length) {
      const u = bestPath[i];
      const v = bestPath[i + 1];
      const edges = adjacency[u] || [];
      for (const e of edges) {
        if (e.to === v) {
          totalTime += e.time;
          totalDist += e.dist;
          break;
        }
      }
    }

    if (isChange) {
      interchange++;
      steps.push({
        station: curr.station,
        line: curr.line,
        nextLine: routeNodes[i + 1].line,
        isChange: true
      });
      if (curr.station === routeNodes[i + 1].station) {
        i++; // skip duplicate station row
      }
    } else {
      steps.push({
        station: curr.station,
        line: curr.line,
        isChange: false
      });
    }
  }

  return {
    source: station1,
    destination: station2,
    routeType,
    startLine: routeNodes[0].line,
    steps,
    interchange,
    totalTime,
    totalDist: Number(totalDist.toFixed(2)),
    totalStations: steps.length
  };
}

// ----------------- MAIN APP COMPONENT -----------------
export default function App() {
  const [source, setSource] = useState('Kashmere Gate');
  const [destination, setDestination] = useState('Botanical Garden');
  const [routeType, setRouteType] = useState('fastest'); // 'fastest' | 'interchange' | 'distance'
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [route, setRoute] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Initialize Trie once
  const trie = useMemo(() => {
    const t = new Trie();
    for (const station of metroData.stations) {
      t.insert(station);
    }
    return t;
  }, []);

  const handleSourceChange = (val) => {
    setSource(val);
    setSourceSuggestions(trie.getSuggestions(val));
  };

  const handleDestChange = (val) => {
    setDestination(val);
    setDestSuggestions(trie.getSuggestions(val));
  };

  const calculateRoute = (src = source, dest = destination, type = routeType) => {
    if (!src.trim() || !dest.trim()) return;

    if (src.trim() === dest.trim()) {
      alert('Source and destination are the same station!');
      return;
    }

    const res = runDijkstra(src.trim(), dest.trim(), type);
    setRoute(res);
    setHasSearched(true);
    setSourceSuggestions([]);
    setDestSuggestions([]);
  };

  const handleFindRoute = (e) => {
    if (e) e.preventDefault();
    calculateRoute(source, destination, routeType);
  };

  const handleRouteTypeChange = (type) => {
    setRouteType(type);
    if (hasSearched) {
      calculateRoute(source, destination, type);
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    setSourceSuggestions([]);
    setDestSuggestions([]);
    if (hasSearched) {
      calculateRoute(destination, temp, routeType);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>🚇 Delhi Metro Route Planner</h1>
        <p>Find shortest paths and line interchanges across 250+ Delhi Metro stations</p>
      </header>

      {/* Input Card */}
      <div className="card">
        <form onSubmit={handleFindRoute} className="form-grid">
          {/* Source Input */}
          <div className="input-group">
            <label>Source Station:</label>
            <input
              type="text"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="Type station name (e.g. Rajiv Chowk)..."
              autoComplete="off"
            />
            {sourceSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {sourceSuggestions.map((st) => (
                  <li
                    key={st}
                    onClick={() => {
                      setSource(st);
                      setSourceSuggestions([]);
                    }}
                  >
                    {st}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Swap Button */}
          <div className="swap-box">
            <button type="button" className="swap-btn" onClick={handleSwap} title="Swap stations">
              ⇅ Swap
            </button>
          </div>

          {/* Destination Input */}
          <div className="input-group">
            <label>Destination Station:</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestChange(e.target.value)}
              placeholder="Type station name (e.g. Botanical Garden)..."
              autoComplete="off"
            />
            {destSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {destSuggestions.map((st) => (
                  <li
                    key={st}
                    onClick={() => {
                      setDestination(st);
                      setDestSuggestions([]);
                    }}
                  >
                    {st}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Route Type Selector (Fastest, Less Interchange, Smallest Distance) */}
          <div className="route-types-container">
            <label className="type-label">Select Route Type:</label>
            <div className="type-buttons">
              <button
                type="button"
                className={`type-btn ${routeType === 'fastest' ? 'active' : ''}`}
                onClick={() => handleRouteTypeChange('fastest')}
              >
                ⚡ Fastest Route
              </button>
              <button
                type="button"
                className={`type-btn ${routeType === 'interchange' ? 'active' : ''}`}
                onClick={() => handleRouteTypeChange('interchange')}
              >
                🔄 Less Interchange
              </button>
              <button
                type="button"
                className={`type-btn ${routeType === 'distance' ? 'active' : ''}`}
                onClick={() => handleRouteTypeChange('distance')}
              >
                📏 Smallest Distance
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button type="submit" className="find-btn">
              🔍 Find Route
            </button>
          </div>
        </form>

        {/* Quick Station Picks */}
        <div className="quick-picks">
          <span>Popular:</span>
          <button type="button" onClick={() => { setSource('Rajiv Chowk'); setDestination('Hauz Khas'); calculateRoute('Rajiv Chowk', 'Hauz Khas'); }}>
            Rajiv Chowk ➔ Hauz Khas
          </button>
          <button type="button" onClick={() => { setSource('Kashmere Gate'); setDestination('Botanical Garden'); calculateRoute('Kashmere Gate', 'Botanical Garden'); }}>
            Kashmere Gate ➔ Botanical Garden
          </button>
          <button type="button" onClick={() => { setSource('New Delhi'); setDestination('Dwarka Sector 21'); calculateRoute('New Delhi', 'Dwarka Sector 21'); }}>
            New Delhi ➔ Dwarka Sec 21
          </button>
        </div>
      </div>

      {/* Results View */}
      {route && (
        <div className="card result-card">
          <div className="result-header">
            <h2>Journey Summary</h2>
            <div className="badge-row">
              <span className="badge">Type: <strong>{route.routeType === 'fastest' ? 'Fastest' : (route.routeType === 'interchange' ? 'Less Interchange' : 'Smallest Distance')}</strong></span>
              <span className="badge">⏱️ ~<strong>{route.totalTime}</strong> mins</span>
              <span className="badge">📏 <strong>{route.totalDist}</strong> km</span>
              <span className="badge">Stops: <strong>{route.totalStations}</strong></span>
              <span className="badge">Interchanges: <strong>{route.interchange}</strong></span>
            </div>
          </div>

          <div className="board-info" style={{ borderLeft: `5px solid ${LINE_COLORS[route.startLine] || '#0072CE'}` }}>
            Board <strong>{route.startLine} Line</strong> at <strong>{route.source}</strong>
          </div>

          {/* Step-by-Step Route List */}
          <div className="route-list">
            {route.steps.map((step, idx) => {
              const lineColor = LINE_COLORS[step.line] || '#0072CE';

              return (
                <div key={idx} className="route-item">
                  <div className="bullet" style={{ backgroundColor: lineColor }}></div>
                  <div className="station-details">
                    <span className="station-name">{step.station}</span>
                    <span className="line-tag" style={{ backgroundColor: lineColor }}>
                      {step.line}
                    </span>

                    {step.isChange && (
                      <div className="interchange-alert">
                        🔄 Change here from <strong>{step.line}</strong> to <strong>{step.nextLine}</strong> Line
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasSearched && !route && (
        <div className="card no-route">
          <p>❌ No path found between <strong>{source}</strong> and <strong>{destination}</strong>. Please check station names.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Delhi Metro Route Planner • Built with React & C++ STL (Dijkstra + Trie)</p>
      </footer>
    </div>
  );
}
