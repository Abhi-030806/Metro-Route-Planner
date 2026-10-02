#ifndef METRO_SEARCH_H
#define METRO_SEARCH_H

#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <cctype>

/**
 * @class Trie
 * @brief Implements an O(L) Trie-based prefix search data structure
 *        for real-time station autocomplete across the Delhi Metro network.
 */
class Trie {
private:
    struct TrieNode {
        std::unordered_map<char, TrieNode*> children;
        bool isEndOfWord;
        std::string originalWord;

        TrieNode() : isEndOfWord(false), originalWord("") {}

        ~TrieNode() {
            for (auto& pair : children) {
                delete pair.second;
            }
        }
    };

    TrieNode* root;
    size_t totalWords;

    // Helper: convert string to lowercase for case-insensitive matching
    static std::string toLower(const std::string& str) {
        std::string lower = str;
        std::transform(lower.begin(), lower.end(), lower.begin(),
                       [](unsigned char c) { return std::tolower(c); });
        return lower;
    }

    // Depth-First Search to collect autocomplete suggestions
    void dfs(TrieNode* node, std::vector<std::string>& suggestions, int limit) const {
        if (!node || (limit > 0 && static_cast<int>(suggestions.size()) >= limit)) {
            return;
        }

        if (node->isEndOfWord) {
            suggestions.push_back(node->originalWord);
            if (limit > 0 && static_cast<int>(suggestions.size()) >= limit) {
                return;
            }
        }

        // Traverse children deterministically
        for (const auto& pair : node->children) {
            dfs(pair.second, suggestions, limit);
            if (limit > 0 && static_cast<int>(suggestions.size()) >= limit) {
                return;
            }
        }
    }

public:
    Trie() : root(new TrieNode()), totalWords(0) {}

    ~Trie() {
        delete root;
    }

    // Prevent copy to avoid double free
    Trie(const Trie&) = delete;
    Trie& operator=(const Trie&) = delete;

    /**
     * @brief Inserts a station name into the Trie.
     * @param word Station name (e.g., "Rajiv Chowk")
     * Time Complexity: O(L) where L is string length.
     */
    void insert(const std::string& word) {
        if (word.empty()) return;

        TrieNode* curr = root;
        std::string normalized = toLower(word);

        for (char ch : normalized) {
            if (curr->children.find(ch) == curr->children.end()) {
                curr->children[ch] = new TrieNode();
            }
            curr = curr->children[ch];
        }

        if (!curr->isEndOfWord) {
            curr->isEndOfWord = true;
            curr->originalWord = word;
            totalWords++;
        }
    }

    /**
     * @brief Checks if a station exists with exact matching.
     * @param word Station name
     * Time Complexity: O(L)
     */
    bool search(const std::string& word) const {
        if (word.empty()) return false;

        TrieNode* curr = root;
        std::string normalized = toLower(word);

        for (char ch : normalized) {
            auto it = curr->children.find(ch);
            if (it == curr->children.end()) {
                return false;
            }
            curr = it->second;
        }

        return curr->isEndOfWord;
    }

    /**
     * @brief Retrieves real-time autocomplete suggestions for a given prefix.
     * @param prefix Input prefix typed by user (e.g., "hauz", "raj")
     * @param limit Maximum number of suggestions to return (default: 10, 0 for all)
     * @return Vector of matching station names
     * Time Complexity: O(P + K) where P is prefix length, K is number of matched nodes.
     */
    std::vector<std::string> getSuggestions(const std::string& prefix, int limit = 10) const {
        if (prefix.empty()) return {};

        TrieNode* curr = root;
        std::string normalized = toLower(prefix);

        for (char ch : normalized) {
            auto it = curr->children.find(ch);
            if (it == curr->children.end()) {
                return {}; // No station matches prefix
            }
            curr = it->second;
        }

        std::vector<std::string> suggestions;
        dfs(curr, suggestions, limit);
        return suggestions;
    }

    size_t size() const {
        return totalWords;
    }
};

#endif // METRO_SEARCH_H
