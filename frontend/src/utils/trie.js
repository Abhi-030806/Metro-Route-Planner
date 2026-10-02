/**
 * Trie-based Prefix Search Algorithm for Station Autocomplete
 * Time Complexity:
 *   - Insertion: O(L) where L is string length
 *   - Prefix Search: O(P + K) where P is prefix length, K is number of matched nodes
 */
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.originalWord = '';
    this.lines = new Set();
  }
}

export class StationTrie {
  constructor() {
    this.root = new TrieNode();
    this.totalStations = 0;
  }

  normalize(str) {
    return str.toLowerCase().trim();
  }

  insert(stationName, lineName = null) {
    if (!stationName) return;

    let node = this.root;
    const normalized = this.normalize(stationName);

    for (const ch of normalized) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
    }

    if (!node.isEnd) {
      node.isEnd = true;
      node.originalWord = stationName;
      this.totalStations++;
    }
    if (lineName) {
      node.lines.add(lineName);
    }
  }

  search(stationName) {
    if (!stationName) return false;
    let node = this.root;
    const normalized = this.normalize(stationName);

    for (const ch of normalized) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  getSuggestions(prefix, limit = 8) {
    if (!prefix || prefix.trim() === '') return [];

    let node = this.root;
    const normalized = this.normalize(prefix);

    for (const ch of normalized) {
      if (!node.children[ch]) {
        // Also support sub-word matching as fallback (e.g. typing "gate" for "Kashmere Gate")
        return this.fuzzySubwordMatch(normalized, limit);
      }
      node = node.children[ch];
    }

    const results = [];
    this.collectWords(node, results, limit);

    // If prefix matched few results, supplement with sub-word matches
    if (results.length < limit) {
      const subwordResults = this.fuzzySubwordMatch(normalized, limit);
      const existingNames = new Set(results.map(r => r.name));
      for (const item of subwordResults) {
        if (!existingNames.has(item.name) && results.length < limit) {
          results.push(item);
        }
      }
    }

    return results;
  }

  collectWords(node, results, limit) {
    if (!node || results.length >= limit) return;

    if (node.isEnd) {
      results.push({
        name: node.originalWord,
        lines: Array.from(node.lines)
      });
      if (results.length >= limit) return;
    }

    for (const ch of Object.keys(node.children).sort()) {
      this.collectWords(node.children[ch], results, limit);
      if (results.length >= limit) return;
    }
  }

  // Fallback to find stations containing the substring anywhere in their name
  fuzzySubwordMatch(sub, limit = 8) {
    const matches = [];
    const traverse = (node) => {
      if (!node || matches.length >= limit) return;
      if (node.isEnd) {
        const lower = node.originalWord.toLowerCase();
        if (lower.includes(sub)) {
          matches.push({
            name: node.originalWord,
            lines: Array.from(node.lines)
          });
        }
      }
      for (const key of Object.keys(node.children)) {
        traverse(node.children[key]);
      }
    };
    traverse(this.root);
    return matches;
  }
}
