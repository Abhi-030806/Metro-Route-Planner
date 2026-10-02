#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <sstream>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include <algorithm>
#include <iomanip>
#include <climits>
#include "search.cpp"

/**
 * Node representation in the transit graph.
 * A physical station can have multiple nodes if served by multiple lines (interchanges).
 */
struct StationNode {
    int id;
    std::string station;
    std::string line;
};

/**
 * Directed/Undirected weighted edge between transit stations.
 */
struct Edge {
    int to;
    int timeMinutes;
    double distKm;
    bool isTransfer;
    std::string line;
};

/**
 * Detailed step in a computed itinerary.
 */
struct RouteStep {
    std::string station;
    std::string line;
    int timeMinutes;
    double distKm;
    bool isTransfer;
    std::string transferNote;
};

/**
 * Complete route result returned by Dijkstra engine.
 */
struct RouteResult {
    bool found;
    std::string source;
    std::string destination;
    double totalDistKm;
    int totalTimeMinutes;
    int interchangeCount;
    int stationCount;
    std::vector<int> pathNodeIds;
    std::vector<RouteStep> steps;

    RouteResult() : found(false), totalDistKm(0.0), totalTimeMinutes(0),
                    interchangeCount(0), stationCount(0) {}
};

/**
 * @class MetroGraph
 * @brief Models the Delhi Metro network as a weighted graph spanning 250+ stations
 *        across 13 transit lines with O((V + E) log V) Dijkstra routing.
 */
class MetroGraph {
private:
    std::vector<StationNode> nodes;
    std::vector<std::vector<Edge>> adj;
    std::unordered_map<std::string, int> nodeLookup; // "Station#Line" -> id
    std::unordered_map<std::string, std::vector<int>> stationToNodeIds; // Station -> list of ids
    std::unordered_set<std::string> uniqueLines;

    // Helper to find data directory path (checks ./data and ../data)
    static std::string resolveDataPath(const std::string& filename, const std::string& baseDir = "") {
        if (!baseDir.empty()) {
            std::string candidate = baseDir + "/" + filename;
            std::ifstream test(candidate);
            if (test.good()) return candidate;
        }
        std::vector<std::string> prefixes = {"data/", "../data/", "./"};
        for (const auto& prefix : prefixes) {
            std::string fullPath = prefix + filename;
            std::ifstream test(fullPath);
            if (test.good()) {
                return fullPath;
            }
        }
        return filename;
    }

public:
    MetroGraph() = default;

    /**
     * @brief Adds or retrieves a unique station-line node.
     */
    int addNode(const std::string& station, const std::string& line) {
        std::string key = station + "#" + line;
        auto it = nodeLookup.find(key);
        if (it != nodeLookup.end()) {
            return it->second;
        }

        int id = static_cast<int>(nodes.size());
        nodes.push_back({id, station, line});
        adj.emplace_back();
        nodeLookup[key] = id;
        stationToNodeIds[station].push_back(id);
        uniqueLines.insert(line);
        return id;
    }

    /**
     * @brief Adds a bidirectional edge between two station-line nodes.
     */
    void addEdge(const std::string& s1, const std::string& l1,
                 const std::string& s2, const std::string& l2,
                 int timeMin, double distKm, bool isTransfer = false) {
        int u = addNode(s1, l1);
        int v = addNode(s2, l2);

        adj[u].push_back({v, timeMin, distKm, isTransfer, l2});
        adj[v].push_back({u, timeMin, distKm, isTransfer, l1});
    }

    /**
     * @brief Parses a transit line CSV file.
     * Expected format: line,station,distance_from_start
     */
    bool loadLineCSV(const std::string& filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            std::cerr << "Warning: Could not open line CSV: " << filepath << "\n";
            return false;
        }

        std::string line;
        std::getline(file, line); // Skip CSV header

        std::string prevStation = "";
        std::string prevLine = "";
        double prevDist = 0.0;

        while (std::getline(file, line)) {
            if (line.empty()) continue;
            std::stringstream ss(line);
            std::string lineName, stationName, distStr;

            if (!std::getline(ss, lineName, ',') ||
                !std::getline(ss, stationName, ',') ||
                !std::getline(ss, distStr, ',')) {
                continue;
            }

            // Trim whitespace
            auto trim = [](std::string& s) {
                while (!s.empty() && (s.back() == '\r' || s.back() == ' ' || s.back() == '\t')) s.pop_back();
                while (!s.empty() && (s.front() == ' ' || s.front() == '\t')) s.erase(s.begin());
            };
            trim(lineName);
            trim(stationName);
            trim(distStr);

            double dist = std::stod(distStr);
            addNode(stationName, lineName);

            if (!prevStation.empty() && prevLine == lineName) {
                double edgeDist = std::abs(dist - prevDist);
                int edgeTime = std::max(1, static_cast<int>(std::round(edgeDist * 2.0)));
                addEdge(stationName, lineName, prevStation, prevLine, edgeTime, edgeDist, false);
            }

            prevStation = stationName;
            prevLine = lineName;
            prevDist = dist;
        }
        return true;
    }

    /**
     * @brief Parses the interchange CSV file.
     * Expected format: station1,line1,station2,line2,time,dist
     */
    bool loadInterchangesCSV(const std::string& filepath) {
        std::ifstream file(filepath);
        if (!file.is_open()) {
            std::cerr << "Warning: Could not open interchanges CSV: " << filepath << "\n";
            return false;
        }

        std::string line;
        std::getline(file, line); // Skip header

        while (std::getline(file, line)) {
            if (line.empty()) continue;
            std::stringstream ss(line);
            std::string s1, l1, s2, l2, timeStr, distStr;

            if (!std::getline(ss, s1, ',') ||
                !std::getline(ss, l1, ',') ||
                !std::getline(ss, s2, ',') ||
                !std::getline(ss, l2, ',') ||
                !std::getline(ss, timeStr, ',') ||
                !std::getline(ss, distStr, ',')) {
                continue;
            }

            auto trim = [](std::string& s) {
                while (!s.empty() && (s.back() == '\r' || s.back() == ' ' || s.back() == '\t')) s.pop_back();
                while (!s.empty() && (s.front() == ' ' || s.front() == '\t')) s.erase(s.begin());
            };
            trim(s1); trim(l1); trim(s2); trim(l2); trim(timeStr); trim(distStr);

            int timeMin = std::stoi(timeStr);
            double distKm = std::stod(distStr);

            addEdge(s1, l1, s2, l2, timeMin, distKm, true);
        }
        return true;
    }

    /**
     * @brief Automates full graph construction across all 13 transit lines and interchanges.
     */
    bool loadNetwork(const std::string& baseDir = "") {
        std::vector<std::string> lineFiles = {
            "blue_main.csv", "Blue_Vaishali.csv", "Yellow.csv", "red.csv",
            "green.csv", "green_branch.csv", "violet.csv", "pink.csv",
            "magenta.csv", "rapid.csv", "airport.csv", "aqua.csv", "grey.csv"
        };

        bool allLoaded = true;
        for (const auto& file : lineFiles) {
            std::string resolved = resolveDataPath(file, baseDir);
            if (!loadLineCSV(resolved)) {
                allLoaded = false;
            }
        }

        std::string interchangeFile = resolveDataPath("linechange.csv", baseDir);
        if (!loadInterchangesCSV(interchangeFile)) {
            allLoaded = false;
        }

        return allLoaded;
    }

    std::vector<std::string> getAllStations() const {
        std::vector<std::string> stations;
        stations.reserve(stationToNodeIds.size());
        for (const auto& pair : stationToNodeIds) {
            stations.push_back(pair.first);
        }
        std::sort(stations.begin(), stations.end());
        return stations;
    }

    std::vector<std::string> getAllLines() const {
        std::vector<std::string> lines(uniqueLines.begin(), uniqueLines.end());
        std::sort(lines.begin(), lines.end());
        return lines;
    }

    size_t getStationCount() const { return stationToNodeIds.size(); }
    size_t getNodeCount() const { return nodes.size(); }
    size_t getLineCount() const { return uniqueLines.size(); }

    bool hasStation(const std::string& station) const {
        return stationToNodeIds.find(station) != stationToNodeIds.end();
    }

    /**
     * @brief O((V + E) log V) Dijkstra-based shortest path routing engine.
     * @param srcStation Name of source station
     * @param destStation Name of destination station
     * @param optimizationMode 0 = Fastest Time, 1 = Shortest Distance, 2 = Fewest Interchanges
     */
    RouteResult findRoute(const std::string& srcStation,
                          const std::string& destStation,
                          int optimizationMode = 0) const {
        RouteResult result;
        result.source = srcStation;
        result.destination = destStation;

        if (!hasStation(srcStation) || !hasStation(destStation)) {
            return result;
        }

        if (srcStation == destStation) {
            result.found = true;
            result.stationCount = 1;
            int nodeId = stationToNodeIds.at(srcStation).front();
            result.pathNodeIds.push_back(nodeId);
            result.steps.push_back({srcStation, nodes[nodeId].line, 0, 0.0, false, "Source and destination are identical."});
            return result;
        }

        const auto& srcNodeIds = stationToNodeIds.at(srcStation);
        const auto& destNodeIds = stationToNodeIds.at(destStation);

        double bestCost = 1e18;
        std::vector<int> bestPath;

        // Weights: timeCoeff, distCoeff, interchangePenalty
        double wTime = 1.0, wDist = 0.0, wTransfer = 8.0;
        if (optimizationMode == 1) { // Shortest Distance
            wTime = 0.0; wDist = 1.0; wTransfer = 0.5;
        } else if (optimizationMode == 2) { // Fewest Interchanges
            wTime = 0.2; wDist = 0.0; wTransfer = 1000.0;
        }

        int totalV = static_cast<int>(nodes.size());

        for (int srcId : srcNodeIds) {
            std::vector<double> dist(totalV, 1e18);
            std::vector<int> parent(totalV, -1);

            // Min-priority queue: {cost, nodeId}
            std::priority_queue<
                std::pair<double, int>,
                std::vector<std::pair<double, int>>,
                std::greater<std::pair<double, int>>
            > pq;

            dist[srcId] = 0.0;
            pq.push({0.0, srcId});

            while (!pq.empty()) {
                auto [d, u] = pq.top();
                pq.pop();

                if (d > dist[u]) continue;

                for (const auto& edge : adj[u]) {
                    int v = edge.to;
                    double weight = (wTime * edge.timeMinutes) +
                                    (wDist * edge.distKm) +
                                    (edge.isTransfer ? wTransfer : 0.0);

                    if (dist[u] + weight < dist[v]) {
                        dist[v] = dist[u] + weight;
                        parent[v] = u;
                        pq.push({dist[v], v});
                    }
                }
            }

            for (int destId : destNodeIds) {
                if (dist[destId] < bestCost) {
                    bestCost = dist[destId];
                    std::vector<int> path;
                    for (int curr = destId; curr != -1; curr = parent[curr]) {
                        path.push_back(curr);
                    }
                    std::reverse(path.begin(), path.end());
                    bestPath = path;
                }
            }
        }

        if (bestPath.empty()) {
            return result;
        }

        result.found = true;
        result.pathNodeIds = bestPath;

        // Reconstruct itinerary and compute physical metrics
        double accumDist = 0.0;
        int accumTime = 0;
        int interchanges = 0;
        std::unordered_set<std::string> visitedStations;

        for (size_t i = 0; i < bestPath.size(); i++) {
            int u = bestPath[i];
            const auto& nodeU = nodes[u];
            visitedStations.insert(nodeU.station);

            if (i == 0) {
                result.steps.push_back({
                    nodeU.station,
                    nodeU.line,
                    0,
                    0.0,
                    false,
                    "Board " + nodeU.line + " Line at " + nodeU.station
                });
                continue;
            }

            int prev = bestPath[i - 1];
            const auto& nodePrev = nodes[prev];

            // Locate edge connecting prev -> u
            int edgeTime = 0;
            double edgeDist = 0.0;
            bool isTransfer = false;
            for (const auto& edge : adj[prev]) {
                if (edge.to == u) {
                    edgeTime = edge.timeMinutes;
                    edgeDist = edge.distKm;
                    isTransfer = edge.isTransfer;
                    break;
                }
            }

            accumDist += edgeDist;
            accumTime += edgeTime;

            if (isTransfer || nodePrev.line != nodeU.line) {
                interchanges++;
                std::string note = "Transfer from " + nodePrev.line + " Line to " +
                                   nodeU.line + " Line (approx " + std::to_string(edgeTime) + " mins walk)";
                result.steps.push_back({nodeU.station, nodeU.line, edgeTime, edgeDist, true, note});
            } else {
                result.steps.push_back({nodeU.station, nodeU.line, edgeTime, edgeDist, false, ""});
            }
        }

        result.totalDistKm = accumDist;
        result.totalTimeMinutes = accumTime;
        result.interchangeCount = interchanges;
        result.stationCount = static_cast<int>(visitedStations.size());

        return result;
    }

    /**
     * @brief Formats and prints the computed route to console.
     */
    void printRoute(const RouteResult& res) const {
        if (!res.found) {
            std::cout << "\n❌ No valid transit path found between "
                      << res.source << " and " << res.destination << ".\n";
            return;
        }

        std::cout << "\n=======================================================\n";
        std::cout << "               DELHI METRO TRANSIT ROUTE               \n";
        std::cout << "=======================================================\n";
        std::cout << "📍 Source Station      : " << res.source << "\n";
        std::cout << "🎯 Destination Station : " << res.destination << "\n";
        std::cout << "⏱️  Estimated Time      : " << res.totalTimeMinutes << " mins\n";
        std::cout << "📏 Distance            : " << std::fixed << std::setprecision(2) << res.totalDistKm << " km\n";
        std::cout << "🔄 Line Interchanges   : " << res.interchangeCount << "\n";
        std::cout << "🚇 Total Stations      : " << res.stationCount << "\n";
        std::cout << "-------------------------------------------------------\n";
        std::cout << "JOURNEY TIMELINE:\n\n";

        for (size_t i = 0; i < res.steps.size(); i++) {
            const auto& step = res.steps[i];
            if (i == 0) {
                std::cout << " [START] 🟢 " << step.station << " [" << step.line << " Line]\n";
            } else if (i + 1 == res.steps.size()) {
                std::cout << " [END]   🏁 " << step.station << " [" << step.line << " Line]\n";
            } else if (step.isTransfer) {
                std::cout << "         🔄 INTERCHANGE: " << step.transferNote << "\n";
                std::cout << "                 Now on " << step.station << " [" << step.line << " Line]\n";
            } else {
                std::cout << "         │  " << step.station << " [" << step.line << " Line]\n";
            }
        }
        std::cout << "=======================================================\n\n";
    }
};

/**
 * Interactive station selection helper using Trie autocomplete.
 */
std::string promptStationSelection(const Trie& trie, const std::string& promptLabel) {
    while (true) {
        std::cout << promptLabel << " (type prefix for autocomplete): ";
        std::string input;
        std::getline(std::cin, input);

        if (input.empty()) continue;

        // Check if exact match exists
        if (trie.search(input)) {
            return input;
        }

        // Fetch suggestions
        auto suggestions = trie.getSuggestions(input, 10);
        if (suggestions.empty()) {
            std::cout << "⚠️  No stations found matching prefix \"" << input << "\". Please try again.\n";
            continue;
        }

        std::cout << "\nSuggestions matching \"" << input << "\":\n";
        for (size_t i = 0; i < suggestions.size(); i++) {
            std::cout << "  [" << (i + 1) << "] " << suggestions[i] << "\n";
        }
        std::cout << "  [0] Re-type search query\n";
        std::cout << "Select option (1-" << suggestions.size() << ") or 0: ";

        int choice;
        if (!(std::cin >> choice)) {
            std::cin.clear();
            std::string discard;
            std::getline(std::cin, discard);
            std::cout << "Invalid input. Please try again.\n";
            continue;
        }
        std::cin.ignore();

        if (choice >= 1 && choice <= static_cast<int>(suggestions.size())) {
            return suggestions[choice - 1];
        } else if (choice == 0) {
            continue;
        } else {
            std::cout << "Invalid selection. Please try again.\n";
        }
    }
}

int main() {
    MetroGraph graph;
    std::cout << "Initializing Delhi Metro Routing Engine...\n";

    if (!graph.loadNetwork()) {
        std::cerr << "Failed to construct full metro network.\n";
        return 1;
    }

    std::cout << "✓ Loaded " << graph.getStationCount() << " stations across "
              << graph.getLineCount() << " transit lines.\n";

    // Build Trie index for O(L) prefix-based station search
    Trie trie;
    for (const auto& station : graph.getAllStations()) {
        trie.insert(station);
    }
    std::cout << "✓ Indexed " << trie.size() << " stations in Trie autocomplete engine.\n\n";

    while (true) {
        std::cout << "*******************************************************\n";
        std::cout << "         DELHI METRO ROUTE PLANNER (CLI)               \n";
        std::cout << "*******************************************************\n";
        std::cout << "1. Plan Route Between Two Stations\n";
        std::cout << "2. Search Station with Trie Autocomplete\n";
        std::cout << "3. List All Transit Lines\n";
        std::cout << "4. Exit\n";
        std::cout << "Enter your choice (1-4): ";

        int choice;
        if (!(std::cin >> choice)) {
            break;
        }
        std::cin.ignore();

        if (choice == 1) {
            std::string source = promptStationSelection(trie, "\nEnter Source Station");
            std::string dest = promptStationSelection(trie, "Enter Destination Station");

            std::cout << "\nChoose Route Optimization:\n";
            std::cout << "  1. Fastest Route (Default)\n";
            std::cout << "  2. Shortest Distance\n";
            std::cout << "  3. Fewest Interchanges\n";
            std::cout << "Selection (1-3): ";
            int modeChoice = 1;
            std::cin >> modeChoice;
            std::cin.ignore();

            int optMode = (modeChoice == 2) ? 1 : (modeChoice == 3 ? 2 : 0);
            RouteResult res = graph.findRoute(source, dest, optMode);
            graph.printRoute(res);
        } else if (choice == 2) {
            std::cout << "\nEnter station prefix to test Trie autocomplete: ";
            std::string query;
            std::getline(std::cin, query);
            auto matches = trie.getSuggestions(query, 15);
            std::cout << "Found " << matches.size() << " suggestions for \"" << query << "\":\n";
            for (const auto& st : matches) {
                std::cout << "  • " << st << "\n";
            }
            std::cout << "\n";
        } else if (choice == 3) {
            std::cout << "\nActive Transit Lines (" << graph.getLineCount() << " lines):\n";
            for (const auto& line : graph.getAllLines()) {
                std::cout << "  - " << line << "\n";
            }
            std::cout << "\n";
        } else {
            std::cout << "Exiting Metro Route Planner. Have a safe journey!\n";
            break;
        }
    }

    return 0;
}
