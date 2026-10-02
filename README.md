# 🚇 Delhi Metro Route Planner

An intelligent, clean transit routing system and interactive web interface for the **Delhi Metro Rail Corporation (DMRC)** network.

[![C++17](https://img.shields.io/badge/C%2B%2B-17-blue.svg?style=flat&logo=c%2B%2B)](https://en.cppreference.com/w/cpp/17)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)

---

## 📌 Project Overview

- **Modeled the Delhi Metro network as a weighted graph spanning 250+ stations across 13 transit lines**, automating graph construction from real-world CSV datasets using STL data structures.
- **Engineered an $\mathcal{O}((V + E) \log V)$ Dijkstra-based routing engine** for optimal shortest-path computation, line-interchange tracking, and end-to-end route reconstruction.
- **Implemented an $\mathcal{O}(L)$ Trie-based prefix search algorithm** to power real-time station autocomplete for seamless source and destination selection.
- **Built a responsive frontend interface using React, HTML, and CSS** to visualize computed transit routes, station interchanges, and live autocomplete suggestions.

---

## 📊 Delhi Metro Network Overview

- **262 Unique Stations** across Delhi NCR (Delhi, Noida, Gurugram, Ghaziabad, Faridabad, Bahadurgarh)
- **13 Transit Lines**: Blue, Blue (Branch), Yellow, Red, Green, Green (Branch), Violet, Pink, Magenta, Airport Express, Aqua, Grey, Rapid Metro
- **30 Interchange Hubs**: Rajiv Chowk, Kashmere Gate, Hauz Khas, Central Secretariat, Botanical Garden, etc.
- **Automated CSV Loader**: Reads line stations, cumulative distances, and interchange walking times directly from [`data/`](./data).

---

## 🗂️ Project Structure

```text
Metro-Route-Planner/
├── codes/
│   ├── engine.cpp          # MetroGraph, Dijkstra routing engine & CSV loader
│   └── search.cpp          # Trie prefix search data structure
├── data/
│   ├── Blue_Vaishali.csv   # Line stations & distances
│   ├── Yellow.csv
│   ├── airport.csv
│   ├── aqua.csv
│   ├── blue_main.csv
│   ├── green.csv
│   ├── green_branch.csv
│   ├── grey.csv
│   ├── linechange.csv      # Interchanges (stations, lines, walk time, dist)
│   ├── magenta.csv
│   ├── pink.csv
│   ├── rapid.csv
│   ├── red.csv
│   └── violet.csv
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   │   └── metroData.json   # Extracted station and line data
│   │   ├── App.jsx              # Clean, single-file React component
│   │   ├── App.css              # Clean, modern stylesheet
│   │   └── main.jsx             # React entrypoint
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore              # Ignores executables, node_modules & caches
├── package.json            # Root scripts
└── README.md
```

---

## 🚀 How to Run

### 1. Run the C++ CLI Engine
```bash
# Compile and run
g++ -O2 codes/engine.cpp -o metro && ./metro

# Or with npm script:
npm run run:cpp
```

### 2. Run the React Frontend
```bash
# Start development server
npm run dev

# Or inside frontend folder:
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📜 License
MIT License
