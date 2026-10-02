#include <bits/stdc++.h>
#include "search.cpp"
using namespace std;

struct node {
    string station;
    string line;
};

struct edge {
    int to;
    int time;
    double dist;
    bool transfer;
};

class MetroGraph {
private:
    vector<node> nodes;
    vector<vector<edge>> adj;
    unordered_map<string, int> nodeID;

    // Helper to find file in data/ or ../data/ or current folder
    string getFilePath(string filename) {
        ifstream f(filename);
        if (f.good()) return filename;
        string p1 = "data/" + filename;
        ifstream f1(p1);
        if (f1.good()) return p1;
        string p2 = "../data/" + filename;
        ifstream f2(p2);
        if (f2.good()) return p2;
        return filename;
    }

public:
    unordered_map<string, vector<int>> stationnodes;

    vector<string> getAllStations() {
        vector<string> stations;
        for (auto &p : stationnodes) {
            stations.push_back(p.first);
        }
        return stations;
    }

    void addNode(string station, string line) {
        string key = station + "#" + line;

        if (nodeID.find(key) != nodeID.end()) {
            return;
        }

        int id = nodes.size();
        stationnodes[station].push_back(id);

        nodeID[key] = id;
        nodes.push_back({station, line});

        adj.push_back({});
    }

    void addEdge(string station1, string station2,
                 string line1, string line2,
                 int time, double dist) {

        if (nodeID.find(station1 + "#" + line1) == nodeID.end()) {
            cout << "MISSING: " << station1 + "#" + line1 << endl;
        }
        if (nodeID.find(station2 + "#" + line2) == nodeID.end()) {
            cout << "MISSING: " << station2 + "#" + line2 << endl;
        }
        int u = nodeID[station1 + "#" + line1];
        int v = nodeID[station2 + "#" + line2];
        bool transfer = false;
        if (line1 != line2) {
            transfer = true;
        }
        adj[u].push_back({v, time, dist, transfer});
        adj[v].push_back({u, time, dist, transfer});
    }

    void printgraph() {
        int n = adj.size();
        for (int i = 0; i < n; i++) {
            cout << nodes[i].station << "(" << nodes[i].line << ")" << endl;
            for (edge e : adj[i]) {
                int to = e.to;
                cout << nodes[to].station << "(" << nodes[to].line << ")";
                cout << " " << e.time << "  " << e.dist << endl;
            }
            cout << endl;
        }
    }

    void printNeighbours(string station, string line) {
        int u = nodeID[station + "#" + line];

        cout << station << "(" << line << ")\n";

        for (auto &e : adj[u]) {
            cout << " -> "
                 << nodes[e.to].station
                 << "("
                 << nodes[e.to].line
                 << ") "
                 << e.time
                 << " "
                 << e.dist
                 << '\n';
        }
    }

    pair<double, vector<int>> dijkstra(int src, int dest, double a, double b, double c) {
        int n = nodes.size();

        vector<double> dist(n, 1e18);
        vector<int> parent(n, -1);

        priority_queue<
            pair<double, int>,
            vector<pair<double, int>>,
            greater<pair<double, int>>
        > pq;

        dist[src] = 0;
        pq.push({0.0, src});

        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();

            if (d > dist[u]) continue;

            if (u == dest) break;

            for (auto &e : adj[u]) {
                int v = e.to;
                double wt = a * e.time + b * e.dist + c * (e.transfer ? 1.0 : 0.0);
                if (dist[u] + wt < dist[v]) {
                    dist[v] = dist[u] + wt;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }

        if (dist[dest] >= 1e17) {
            return {-1.0, {}};
        }

        vector<int> path;

        for (int cur = dest; cur != -1; cur = parent[cur]) {
            path.push_back(cur);
        }

        reverse(path.begin(), path.end());

        return {dist[dest], path};
    }

    void getPath(string station1, string station2, int type = 1) {
        if (stationnodes.find(station1) == stationnodes.end() ||
            stationnodes.find(station2) == stationnodes.end()) {
            cout << "Invalid station name\n";
            return;
        }
        if (station1 == station2) {
            cout << "You Are Here Already" << endl;
            return;
        }

        // Set weights (a, b, c) based on user's choice:
        // 1: Fastest Path (minimizes time + interchange penalty)
        // 2: Fewest Interchanges (minimizes line transfers)
        // 3: Smallest Distance (minimizes physical distance in km)
        double a = 1.0, b = 0.0, c = 10.0;
        string typeLabel = "Fastest Route";
        if (type == 2) {
            a = 0.1; b = 0.0; c = 1000.0;
            typeLabel = "Fewest Interchanges";
        } else if (type == 3) {
            a = 0.0; b = 1.0; c = 0.5;
            typeLabel = "Smallest Distance";
        }

        double bestcost = 1e18;
        vector<int> bestPath;
        for (int u : stationnodes[station1]) {
            for (int v : stationnodes[station2]) {
                auto [cost, path] = dijkstra(u, v, a, b, c);
                if (cost != -1.0 && cost < bestcost) {
                    bestcost = cost;
                    bestPath = path;
                }
            }
        }

        if (bestPath.empty()) {
            cout << "No path found\n";
            return;
        }

        int interchange = 0;
        int totalTime = 0;
        double totalDist = 0.0;

        cout << "\n--- Route Type: " << typeLabel << " ---\n";
        cout << "Board "
             << nodes[bestPath[0]].line
             << " Line at "
             << nodes[bestPath[0]].station
             << endl << endl;

        int n = bestPath.size();
        for (int i = 0; i < n; i++) {
            cout << nodes[bestPath[i]].station << endl;

            if (i + 1 < n) {
                // Accumulate physical time and distance
                int u = bestPath[i];
                int v = bestPath[i + 1];
                for (auto &e : adj[u]) {
                    if (e.to == v) {
                        totalTime += e.time;
                        totalDist += e.dist;
                        break;
                    }
                }

                if (nodes[bestPath[i]].line != nodes[bestPath[i + 1]].line) {
                    cout << "Change here from " << nodes[bestPath[i]].line
                         << " to " << nodes[bestPath[i + 1]].line << endl;
                    interchange++;
                    if (nodes[bestPath[i]].station == nodes[bestPath[i + 1]].station) {
                        i++; // skip duplicate station row
                    }
                }
            }
        }

        cout << endl;
        cout << "Total Stations : " << n << endl;
        cout << "Interchanges   : " << interchange << endl;
        cout << "Est. Time      : ~" << totalTime << " mins" << endl;
        cout << "Total Distance : " << fixed << setprecision(2) << totalDist << " km" << endl;
    }

    void loadCSV(string filename) {
        string path = getFilePath(filename);
        ifstream file(path);

        if (!file.is_open()) {
            cout << "cannot open " << filename << endl;
            return;
        }

        string row;
        getline(file, row); // skip header

        string prevstation = "";
        string prevline = "";
        double prevdist = 0;

        while (getline(file, row)) {
            if (row.empty()) continue;
            stringstream line(row);

            string linename;
            string station;
            string diststr;

            getline(line, linename, ',');
            getline(line, station, ',');
            getline(line, diststr, ',');

            // trim
            while (!linename.empty() && (linename.back() == '\r' || linename.back() == ' ')) linename.pop_back();
            while (!station.empty() && (station.back() == '\r' || station.back() == ' ')) station.pop_back();
            while (!diststr.empty() && (diststr.back() == '\r' || diststr.back() == ' ')) diststr.pop_back();

            double dist = stod(diststr);

            addNode(station, linename);
            if (prevstation != "" && prevline == linename) {
                double edgedist = dist - prevdist;
                int time = max(1, (int)round(edgedist * 2));
                addEdge(station, prevstation,
                        linename, prevline,
                        time, edgedist);
            }

            prevstation = station;
            prevline = linename;
            prevdist = dist;
        }
    }

    void loadInterchanges(string filename) {
        string path = getFilePath(filename);
        ifstream file(path);

        if (!file.is_open()) {
            cout << "cannot open " << filename << endl;
            return;
        }

        string row;
        getline(file, row); // skip header

        string station1;
        string station2;
        string line1;
        string line2;
        string timestr;
        string diststr;

        while (getline(file, row)) {
            if (row.empty()) continue;
            stringstream ss(row);

            getline(ss, station1, ',');
            getline(ss, line1, ',');
            getline(ss, station2, ',');
            getline(ss, line2, ',');
            getline(ss, timestr, ',');
            getline(ss, diststr, ',');

            // trim
            while (!station1.empty() && (station1.back() == '\r' || station1.back() == ' ')) station1.pop_back();
            while (!line1.empty() && (line1.back() == '\r' || line1.back() == ' ')) line1.pop_back();
            while (!station2.empty() && (station2.back() == '\r' || station2.back() == ' ')) station2.pop_back();
            while (!line2.empty() && (line2.back() == '\r' || line2.back() == ' ')) line2.pop_back();
            while (!timestr.empty() && (timestr.back() == '\r' || timestr.back() == ' ')) timestr.pop_back();
            while (!diststr.empty() && (diststr.back() == '\r' || diststr.back() == ' ')) diststr.pop_back();

            addEdge(station1, station2,
                    line1, line2,
                    stoi(timestr), stod(diststr));
        }
    }
};

string chooseStation(Trie& trie) {
    while (true) {
        int n;
        string prefix;

        cout << "Enter station prefix: ";
        getline(cin, prefix);

        vector<string> suggestions = trie.getSuggestions(prefix);

        if (suggestions.empty()) {
            cout << "No stations found\n";
            continue;
        }

        cout << endl;
        n = suggestions.size();
        for (int i = 0; i < n; i++) {
            cout << i << " -> " << suggestions[i] << endl;
        }

        cout << "-1 -> Search Again\n";

        int choice;
        cout << "Choose: ";
        cin >> choice;
        cin.ignore();

        if (choice == -1) {
            continue;
        }

        if (choice >= 0 && choice < n) {
            return suggestions[choice];
        }

        cout << "Invalid Choice\n\n";
    }
}

int main() {
    MetroGraph g;

    g.loadCSV("blue_main.csv");
    g.loadCSV("Blue_Vaishali.csv");
    g.loadCSV("Yellow.csv");
    g.loadCSV("red.csv");
    g.loadCSV("green.csv");
    g.loadCSV("green_branch.csv");
    g.loadCSV("violet.csv");
    g.loadCSV("pink.csv");
    g.loadCSV("magenta.csv");
    g.loadCSV("rapid.csv");
    g.loadCSV("airport.csv");
    g.loadCSV("aqua.csv");
    g.loadCSV("grey.csv");

    g.loadInterchanges("linechange.csv");

    Trie trie;

    vector<string> stations = g.getAllStations();

    for (string station : stations) {
        trie.insert(station);
    }

    cout << "Select Source Station\n";
    string source = chooseStation(trie);

    cout << "\nSelect Destination Station\n";
    string destination = chooseStation(trie);

    cout << "\nChoose Route Type:\n";
    cout << "1. Fastest Route (Default)\n";
    cout << "2. Fewest Interchanges\n";
    cout << "3. Smallest Distance\n";
    cout << "Choose (1-3): ";
    int routeType = 1;
    cin >> routeType;
    cin.ignore();

    cout << "\nSource      : " << source << endl;
    cout << "Destination : " << destination << endl;
    cout << endl;

    g.getPath(source, destination, routeType);

    return 0;
}
