# 🚇 Delhi Metro Route Planner

A simple route planner for the Delhi Metro network that finds the best path between any two stations using **Dijkstra's Algorithm** and **Trie Autocomplete**.

---

## 📌 Project Overview

- **Modeled the Delhi Metro network as a weighted graph spanning 250+ stations across 13 transit lines**, automating graph construction from real-world CSV datasets using STL data structures.
- **Engineered an O((V + E) log V) Dijkstra-based routing engine** for optimal shortest-path computation, line-interchange tracking, and end-to-end route reconstruction.
- **Implemented an O(L) Trie-based prefix search algorithm** to power real-time station autocomplete for seamless source and destination selection.
- **Built a responsive frontend interface using React, HTML, and CSS** to visualize computed transit routes, station interchanges, and live autocomplete suggestions.

---

## 🚦 Three Route Options

The routing engine supports 3 types of paths:
1. **⚡ Fastest Route**: Minimizes overall travel time, factoring in station travel and walking transfer penalties.
2. **🔄 Fewest Interchanges**: Prioritizes staying on the same transit line to minimize line switches.
3. **📏 Shortest Distance**: Finds the path with the minimum physical track distance (in km).

---

## 📁 Project Structure

```text
Metro-Route-Planner/
├── codes/
│   ├── engine.cpp          # MetroGraph & Dijkstra routing engine
│   └── search.cpp          # Trie prefix autocomplete search
├── data/
│   ├── Blue_Vaishali.csv   # Line stations & cumulative distances
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
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Styling
│   │   ├── main.jsx        # Entry point
│   │   └── data/           # Parsed station and graph JSON
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

- **C++ (STL)**: Graphs, Priority Queue, Unordered Map, Trie
- **Frontend**: React, HTML, CSS, JavaScript (Vite)
- **Data**: CSV datasets for Delhi Metro routes and interchanges

---

## 🚀 How to Run

### 1. Run the C++ CLI:
```bash
# Compile and run
g++ -O2 codes/engine.cpp -o metro && ./metro
```

### 2. Run the React Web App:
```bash
# Start frontend dev server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 👨‍💻 Author
**Abhishek**  
Feel free to star ⭐ the repository if you found this helpful!
