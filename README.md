# 🚇 Delhi Metro Route Planner

An intelligent, high-performance transit routing system and interactive visualizer for the **Delhi Metro Rail Corporation (DMRC)** network.

[![C++17](https://img.shields.io/badge/C%2B%2B-17-blue.svg?style=flat&logo=c%2B%2B)](https://en.cppreference.com/w/cpp/17)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Algorithm](https://img.shields.io/badge/Routing-Dijkstra%20O((V%2BE)logV)-orange.svg)](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
[![Search](https://img.shields.io/badge/Search-Trie%20O(L)-green.svg)](https://en.wikipedia.org/wiki/Trie)

---

## 📌 Project Highlights

- **Modeled the Delhi Metro network as a weighted graph spanning 250+ stations across 13 transit lines**, automating graph construction from real-world CSV datasets using STL data structures.
- **Engineered an $\mathcal{O}((V + E) \log V)$ Dijkstra-based routing engine** for optimal shortest-path computation, line-interchange tracking, and end-to-end route reconstruction.
- **Implemented an $\mathcal{O}(L)$ Trie-based prefix search algorithm** to power real-time station autocomplete for seamless source and destination selection.
- **Built a responsive frontend interface using React, HTML, and CSS** to visualize computed transit routes, station interchanges, and live autocomplete suggestions.

---

## 📊 Delhi Metro Network Overview

| Metric | Count | Details |
|---|---|---|
| **Total Unique Stations** | **262 Stations** | Covers Delhi, Noida, Greater Noida, Gurugram, Ghaziabad, Faridabad, Bahadurgarh |
| **Transit Lines** | **13 Corridors** | Blue, Blue (Branch), Yellow, Red, Green, Green (Branch), Violet, Pink, Magenta, Airport Express, Aqua, Grey, Rapid Metro |
| **Interchange Hubs** | **30 Stations** | Rajiv Chowk, Kashmere Gate, Hauz Khas, Central Secretariat, Botanical Garden, etc. |
| **Total Graph Nodes** | **287 Station-Line Nodes** | Multiplexed nodes per interchange to model cross-platform walking transfers |
| **Graph Edges** | **608 Directed Edges** | Track segments weighted by travel time (min), distance (km), and transfer penalties |

---

## 🏗️ System Architecture

```text
+-----------------------------------------------------------------------------------+
|                           Delhi Metro Datasets (CSV)                             |
|  13 Line CSVs (distances, stations) + linechange.csv (interchange transfer walk)   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           C++ STL Core Engine                                     |
|  • codes/search.cpp : O(L) Trie Prefix Autocomplete Tree                          |
|  • codes/engine.cpp : Weighted Graph + O((V+E) log V) Dijkstra Routing Engine     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        Responsive React Frontend (Web UI)                         |
|  • Live Trie Prefix Search with match highlighting & line badges                  |
|  • Multi-criteria Dijkstra Routing (Fastest, Shortest Distance, Fewest Transfers)|
|  • Interactive Step-by-Step Transit Timeline with Transfer Alerts                 |
|  • Schematic Transit Network Visualizer highlighting active path & hubs           |
|  • Network Line Directory & DMRC Fare Estimator                                   |
+-----------------------------------------------------------------------------------+
```

---

## 🗂️ Project Structure

```text
Metro-Route-Planner/
├── codes/
│   ├── engine.cpp          # MetroGraph, O((V+E) log V) Dijkstra routing & CSV loader
│   └── search.cpp          # O(L) Trie prefix search & autocomplete data structure
├── data/
│   ├── Blue_Vaishali.csv   # Blue Line branch stations & cumulative distances
│   ├── Yellow.csv          # Yellow Line stations
│   ├── airport.csv         # Airport Express Line
│   ├── aqua.csv            # Aqua Line (Noida Metro)
│   ├── blue_main.csv       # Blue Line main branch
│   ├── green.csv           # Green Line
│   ├── green_branch.csv    # Green Line branch
│   ├── grey.csv            # Grey Line
│   ├── linechange.csv      # Interchange connections (stations, lines, walk time, dist)
│   ├── magenta.csv         # Magenta Line
│   ├── pink.csv            # Pink Line (Ring Metro)
│   ├── rapid.csv           # Rapid Metro (Gurugram)
│   ├── red.csv             # Red Line
│   └── violet.csv          # Violet Line
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                # Header with network statistics & badges
│   │   │   ├── StationAutocomplete.jsx   # Trie-powered live autocomplete input
│   │   │   ├── RouteSummaryCards.jsx     # KPI summary cards & DMRC fare calculator
│   │   │   ├── JourneyTimeline.jsx       # Step-by-step route itinerary & transfers
│   │   │   ├── MetroMapVisualizer.jsx    # Interactive schematic network visualizer
│   │   │   └── LinesDirectoryModal.jsx   # Complete line browser modal
│   │   ├── data/
│   │   │   └── metroData.json            # Parsed graph data with colors & stations
│   │   ├── utils/
│   │   │   ├── trie.js                   # O(L) Trie autocomplete implementation
│   │   │   └── dijkstra.js               # O((V+E) log V) Dijkstra routing engine
│   │   ├── App.jsx                       # Main React application
│   │   ├── index.css                     # Modern transit-themed responsive CSS
│   │   └── main.jsx                      # React entrypoint
│   ├── index.html                        # HTML template
│   ├── package.json                      # Frontend dependencies & scripts
│   └── vite.config.js                    # Vite configuration
├── .gitignore              # Ignores binaries, caches, build artifacts & node_modules
├── package.json            # Root scripts for build and development
└── README.md               # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **C++ Compiler**: `g++` (supporting C++17 or higher)
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

---

### 1. Running the C++ Routing Engine (CLI)

Compile and run the clean C++ engine from the project root:

```bash
# Compile with C++17 and optimization
g++ -std=c++17 -O2 codes/engine.cpp -o metro

# Run the interactive CLI
./metro
```

Or using root npm scripts:
```bash
npm run run:cpp
```

#### CLI Capabilities:
- **Interactive Trie Autocomplete**: Type any prefix (e.g. `raj`, `hauz`, `gate`) to instantly retrieve station suggestions.
- **Route Computation**: Select between Fastest Route, Shortest Distance, and Fewest Interchanges.
- **Detailed Transit Itinerary**: Formats boarding line, each intermediate station, line interchange warnings with walking minutes, and total trip statistics.

---

### 2. Running the Responsive React Frontend

Start the local development server:

```bash
cd frontend
npm install
npm run dev
```

Or from the repository root:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Build for Production:
```bash
npm run build
```
Generates an optimized static bundle in `frontend/dist/`.

---

## 🧮 Algorithmic Complexity

### 1. Trie Station Autocomplete
- **Insertion**: $\mathcal{O}(L)$ per station, where $L$ is the length of the station name.
- **Prefix Lookup**: $\mathcal{O}(P + K)$, where $P$ is the prefix query length and $K$ is the number of matching descendant nodes.
- **Space Complexity**: $\mathcal{O}(\Sigma \cdot L \cdot N)$, where $\Sigma$ is the alphabet size (normalized English alphanumeric + symbols) and $N$ is the number of stations.

### 2. Dijkstra Shortest-Path Transit Routing
- **Graph Representation**: Adjacency list using STL `std::vector<std::vector<Edge>>` with multiplexed station-line nodes ($|V| = 287$, $|E| = 608$).
- **Priority Queue**: Min-Heap using `std::priority_queue<std::pair<double, int>, ..., std::greater<...>>`.
- **Time Complexity**: $\mathcal{O}((|V| + |E|) \log |V|)$ per query.
- **Multi-Factor Cost Function**:
  $$\text{Weight}(u, v) = w_{\text{time}} \cdot \text{time}(u,v) + w_{\text{dist}} \cdot \text{dist}(u,v) + w_{\text{transfer}} \cdot \text{isTransfer}(u,v)$$
  - **Fastest Time Mode**: $w_{\text{time}} = 1.0$, $w_{\text{dist}} = 0.0$, $w_{\text{transfer}} = 8.0 \text{ min}$
  - **Shortest Distance Mode**: $w_{\text{time}} = 0.0$, $w_{\text{dist}} = 1.0$, $w_{\text{transfer}} = 0.5 \text{ km}$
  - **Fewest Interchanges Mode**: $w_{\text{time}} = 0.2$, $w_{\text{dist}} = 0.0$, $w_{\text{transfer}} = 1000.0$

---

## 🎨 Frontend Features

1. **Live Trie Autocomplete Input**:
   - Instant prefix filtering with character highlighting.
   - Shows colored badges for each line connected to the station.
   - Arrow keys, Enter, and Escape keyboard navigation.
   - 1-click station swap button.

2. **Route Summary KPIs**:
   - Estimated Travel Time (in minutes).
   - Total Track Distance (in kilometers).
   - Line Interchanges count.
   - Total Stations passed.
   - Official DMRC fare estimator (with 10% Smart Card / QR discount).

3. **Journey Timeline**:
   - Grouped transit legs with official line colors.
   - Clear transfer instruction cards with platform change & walking time guidance.
   - Collapsible intermediate station list for clean reading.

4. **Interactive Network Schematic**:
   - Visual display of all 13 transit lines.
   - Dynamic glow highlighting along the active computed route.
   - Clickable station chips to set any station as origin or destination.

5. **Lines Directory**:
   - Interactive modal to explore all 13 corridors, terminals, and station sequences.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
