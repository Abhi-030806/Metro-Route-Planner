#include <bits/stdc++.h>
using namespace std;

class Trie{
private:

    struct Node{
        Node* links[256];
        bool isEnd;

        Node(){
            isEnd = false;

            for(int i=0;i<256;i++){
                links[i] = nullptr;
            }
        }
    };

    Node* root;

    void dfs(Node* node,
             string current,
             vector<string>& ans){

        if(node->isEnd){
            ans.push_back(current);
        }

        for(int i=0;i<256;i++){

            if(node->links[i] != nullptr){

                dfs(node->links[i],
                    current + char(i),
                    ans);
            }
        }
    }

public:

    Trie(){
        root = new Node();
    }

    void insert(string word){

        Node* node = root;

        for(char ch : word){

            unsigned char idx = ch;

            if(node->links[idx] == nullptr){
                node->links[idx] = new Node();
            }

            node = node->links[idx];
        }

        node->isEnd = true;
    }

    bool search(string word){

        Node* node = root;

        for(char ch : word){

            unsigned char idx = ch;

            if(node->links[idx] == nullptr){
                return false;
            }

            node = node->links[idx];
        }

        return node->isEnd;
    }

    vector<string> getSuggestions(string prefix){

        Node* node = root;

        for(char ch : prefix){

            unsigned char idx = ch;

            if(node->links[idx] == nullptr){
                return {};
            }

            node = node->links[idx];
        }

        vector<string> ans;

        dfs(node,prefix,ans);

        return ans;
    }
};

struct node{
    string station;
    string line;
};

struct edge{
    int to;
    int time;
    double dist;
    bool transfer;
};

class MetroGraph{
private:
    vector<node> nodes;
    vector<vector<edge>> adj;
    unordered_map<string , int> nodeID;
public:
    unordered_map<string , vector<int>> stationnodes;


    vector<string> getAllStations(){

    vector<string> stations;

    for(auto &p : stationnodes){
        stations.push_back(p.first);
    }

    return stations;
    }

    void addNode(string station , string line){
        string key = station + "#" + line;

        if(nodeID.find(key) != nodeID.end()){
            return;
        }

        int id = nodes.size();
        stationnodes[station].push_back(id);

        nodeID[key] = id;
        nodes.push_back({station , line});
        
        adj.push_back({});

    }
    

    void addEdge(string station1 , string station2 ,
         string line1 , string line2 ,
          int time , double  dist){

        if(nodeID.find(station1 + "#" + line1)== nodeID.end()){
            cout<<"MISSI"<<station1 + "#" + line1<<endl;
        }
        if(nodeID.find(station2 + "#" + line2)== nodeID.end()){
            cout<<"MISSI"<<station2 + "#" + line2<<endl;
        }
        int u = nodeID[station1 + "#" + line1];
        int v = nodeID[station2 + "#" + line2];
        bool transfer = false;
        if(line1 != line2){
            if(station1 != station2){
                return;
            }
            else{
                transfer = true;
            }

        }
        adj[u].push_back({v , time , dist , transfer});
        adj[v].push_back({u , time , dist , transfer});

    }

    void printgraph(){
        int n= adj.size();
        for(int i=0;i<n;i++){
            cout<<nodes[i].station
            <<"("<<nodes[i].line<<")";
            cout<<endl;
            for(edge e : adj[i]){
                int to = e.to;
                cout<<nodes[to].station
                <<"("<<nodes[to].line<<")";
                cout<<" "<<e.time<<"  "<<e.dist;
                cout<<endl;
            }
            cout<<endl;
        }
    }
    void printNeighbours(string station, string line){

        int u = nodeID[station + "#" + line];

        cout << station << "(" << line << ")\n";

        for(auto &e : adj[u]){

            cout
                << " -> "
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

    pair<int, vector<int>> dijkstra(int src, int dest , double a , double b, double c){
        int n = nodes.size();

        vector<int> dist(n, INT_MAX);
        vector<int> parent(n, -1);

        priority_queue<
            pair<int,int>,
            vector<pair<int,int>>,
            greater<pair<int,int>>
        > pq;

        dist[src] = 0;
        pq.push({0, src});
        
        while(!pq.empty()){
            auto [d, u] = pq.top();
            pq.pop();

            if(d > dist[u]) continue;

            if(u == dest) break;

            for(auto &e : adj[u]){
                int v = e.to;
                double wt = a*e.time + b*e.dist + c*e.transfer;   // use e.dist if shortest distance
                if(dist[u] + wt < dist[v]){
                    dist[v] = dist[u] + wt;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }

        if(dist[dest] == INT_MAX){
            return {-1, {}};
        }

        vector<int> path;

        for(int cur = dest; cur != -1; cur = parent[cur]){
            path.push_back(cur);
        }

        reverse(path.begin(), path.end());

        return {dist[dest], path};
    }

    void getPath(string station1 , string station2){
        if(stationnodes.find(station1) == stationnodes.end() ||
            stationnodes.find(station2) == stationnodes.end()){
                cout<<"Invalid station name\n";
                return;
        }
        if(station1 == station2){
            cout<<"You Are Here Already"<<endl;
            return;
        }

        int bestcost = INT_MAX;
        vector<int> bestPath ;
        for(int u : stationnodes[station1]){
            for(int v : stationnodes[station2]){
                auto [cost , path] = dijkstra(u , v , 0 , 0, 1);
                if(cost!= -1 && cost<bestcost){
                    bestcost = cost;
                    bestPath = path;
                }
            }
        }

        if(bestPath.empty()){
            cout<<"No path found\n";
            return;
        }

        int interchange =0;
        cout<<endl;
        cout<<"Board "
            <<nodes[bestPath[0]].line
            <<" Line at "
            <<nodes[bestPath[0]].station
            <<endl << endl;
        int n= bestPath.size();
        for(int i=0;i<n;i++){
            cout<<nodes[bestPath[i]].station<<endl;
            if(i+1<n && nodes[bestPath[i]].station == nodes[bestPath[i+1]].station){
                cout<<"Change here from "<<nodes[bestPath[i]].line<<" to "<<nodes[bestPath[i+1]].line<<endl;
                interchange++;
            }
        }
        cout<<endl;
        //cout<<bestcost<<" km"<<endl;
        cout<<interchange<< " InterChanges"<<endl;
        
    }



    void loadCSV(string filename){
        ifstream file(filename);

        if(!file.is_open()){
            cout<<"cananot open"<<filename<<endl;
            return;
        }

        string row;

        getline(file , row);//skip header

        string prevstation ="";
        string prevline = "";
        double prevdist =0;
        while(getline(file , row)){

            stringstream line(row);

            string linename;
            string station;
            string diststr;

            getline(line , linename , ',');
            getline(line , station, ',');
            getline(line , diststr ,',');

            double dist = stod(diststr);

            addNode(station , linename);
            if(prevstation != "" &&prevline == linename){

                double edgedist = dist - prevdist;

                int time = max(1 , (int)round(edgedist*2));
                addEdge(station , prevstation ,
                        linename , prevline, 
                        time , edgedist);
            }

            prevstation = station;
            prevline = linename;
            prevdist = dist;

        }
        return;

    }
    void loadInterchanges(string filename){

        ifstream file(filename);

        if(!file.is_open()){
            cout<<"cannot open"<<filename<<endl;
            return;
        }
        string row;
        getline(file , row);
        string station1;
        string station2;
        string line1;
        string line2;
        string timestr;
        string diststr;

        while(getline(file , row)){
            stringstream ss(row);

            getline(ss, station1 ,',');
            getline(ss , line1 ,',');
            getline(ss , station2  ,',');
            getline(ss , line2 ,',');
            getline(ss , timestr , ',');
            getline(ss , diststr , ',');

            addEdge(station1 , station2 ,
                    line1 , line2,
                    stoi(timestr) , stod(diststr));
        }
    }

};

string chooseStation(Trie& trie){

    while(true){
        int n;
        string prefix;

        cout<<"Enter station prefix: ";
        getline(cin,prefix);

        vector<string> suggestions =
            trie.getSuggestions(prefix);

        if(suggestions.empty()){
            cout<<"No stations found\n";
            continue;
        }

        cout<<endl;
        n = suggestions.size();
        for(int i=0;i<n;i++){
            cout<<i<<" -> "
                <<suggestions[i]
                <<endl;
        }

        cout<<"-1 -> Search Again\n";

        int choice;

        cout<<"Choose: ";
        cin>>choice;
        cin.ignore();

        if(choice == -1){
            continue;
        }

        if(choice >= 0 &&
           choice < n){

            return suggestions[choice];
        }

        cout<<"Invalid Choice\n\n";
    }
}

int main(){

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

    for(string station : stations){
        trie.insert(station);
    }

    cout<<"Select Source Station\n";
    string source = chooseStation(trie);

    cout<<"\nSelect Destination Station\n";
    string destination = chooseStation(trie);

    cout<<"\nSource      : "
        << source << endl;

    cout<<"Destination : "
        << destination << endl;

    cout<<endl;

    g.getPath(source,destination);

    return 0;
}
