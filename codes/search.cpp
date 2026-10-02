#ifndef SEARCH_CPP
#define SEARCH_CPP

#include <bits/stdc++.h>
using namespace std;

class Trie {
private:
    struct Node {
        Node* links[256];
        bool isEnd;

        Node() {
            isEnd = false;
            for (int i = 0; i < 256; i++) {
                links[i] = nullptr;
            }
        }
    };

    Node* root;

    void dfs(Node* node, string current, vector<string>& ans) {
        if (node->isEnd) {
            ans.push_back(current);
        }

        for (int i = 0; i < 256; i++) {
            if (node->links[i] != nullptr) {
                dfs(node->links[i], current + char(i), ans);
            }
        }
    }

public:
    Trie() {
        root = new Node();
    }

    void insert(string word) {
        Node* node = root;

        for (char ch : word) {
            unsigned char idx = ch;
            if (node->links[idx] == nullptr) {
                node->links[idx] = new Node();
            }
            node = node->links[idx];
        }

        node->isEnd = true;
    }

    bool search(string word) {
        Node* node = root;

        for (char ch : word) {
            unsigned char idx = ch;
            if (node->links[idx] == nullptr) {
                return false;
            }
            node = node->links[idx];
        }

        return node->isEnd;
    }

    vector<string> getSuggestions(string prefix) {
        Node* node = root;

        for (char ch : prefix) {
            unsigned char idx = ch;
            if (node->links[idx] == nullptr) {
                return {};
            }
            node = node->links[idx];
        }

        vector<string> ans;
        dfs(node, prefix, ans);
        return ans;
    }
};

#endif
