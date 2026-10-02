/**
 * Binary Heap Min-Priority Queue for O((V + E) log V) Dijkstra execution
 */
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(element, priority) {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp(index) {
    const item = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIdx];
      if (item.priority >= parent.priority) break;
      this.heap[index] = parent;
      index = parentIdx;
    }
    this.heap[index] = item;
  }

  sinkDown(index) {
    const length = this.heap.length;
    const item = this.heap[index];

    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let swap = null;

      if (leftChildIdx < length) {
        if (this.heap[leftChildIdx].priority < item.priority) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        if (
          (swap === null && this.heap[rightChildIdx].priority < item.priority) ||
          (swap !== null && this.heap[rightChildIdx].priority < this.heap[leftChildIdx].priority)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      index = swap;
    }
    this.heap[index] = item;
  }
}

/**
 * Dijkstra Routing Engine for Delhi Metro Transit Graph
 * @param {Object} metroData - Preprocessed metro graph object
 * @param {string} sourceStation - Name of source station
 * @param {string} destStation - Name of destination station
 * @param {string} mode - 'fastest' | 'distance' | 'fewest_interchanges'
 * @returns {Object} Route result containing path, metrics, and step-by-step instructions
 */
export function computeDijkstraRoute(metroData, sourceStation, destStation, mode = 'fastest') {
  if (!sourceStation || !destStation) return null;

  if (sourceStation === destStation) {
    return {
      found: true,
      source: sourceStation,
      destination: destStation,
      totalTime: 0,
      totalDistance: 0,
      interchanges: 0,
      stationCount: 1,
      steps: [{
        station: sourceStation,
        line: 'Current Station',
        time: 0,
        dist: 0,
        isTransfer: false,
        note: 'You are already at the selected station.'
      }],
      pathStations: [sourceStation]
    };
  }

  const { nodes, adjacency, stationToNodes } = metroData;

  const srcNodeIds = stationToNodes[sourceStation];
  const destNodeIds = stationToNodes[destStation];

  if (!srcNodeIds || !destNodeIds || srcNodeIds.length === 0 || destNodeIds.length === 0) {
    return { found: false, error: 'One or both stations not found in the transit network.' };
  }

  // Weight coefficients based on chosen routing mode
  let wTime = 1.0;
  let wDist = 0.0;
  let wTransfer = 8.0; // 8 minutes perceived interchange penalty

  if (mode === 'distance') {
    wTime = 0.0;
    wDist = 1.0;
    wTransfer = 0.5; // Small penalty for transfer
  } else if (mode === 'fewest_interchanges') {
    wTime = 0.2;
    wDist = 0.0;
    wTransfer = 1000.0; // High penalty to avoid line transfers
  }

  const totalV = nodes.length;
  let bestCost = Infinity;
  let bestPath = null;

  for (const srcId of srcNodeIds) {
    const dist = new Array(totalV).fill(Infinity);
    const parent = new Array(totalV).fill(-1);
    const pq = new MinPriorityQueue();

    dist[srcId] = 0;
    pq.push(srcId, 0);

    while (!pq.isEmpty()) {
      const { element: u, priority: currentD } = pq.pop();

      if (currentD > dist[u]) continue;

      const neighbors = adjacency[u] || [];
      for (const edge of neighbors) {
        const v = edge.to;
        const weight = (wTime * edge.time) +
                       (wDist * edge.dist) +
                       (edge.isTransfer ? wTransfer : 0);

        if (dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          parent[v] = u;
          pq.push(v, dist[v]);
        }
      }
    }

    for (const destId of destNodeIds) {
      if (dist[destId] < bestCost) {
        bestCost = dist[destId];
        const path = [];
        for (let curr = destId; curr !== -1; curr = parent[curr]) {
          path.push(curr);
        }
        path.reverse();
        bestPath = path;
      }
    }
  }

  if (!bestPath || bestPath.length === 0) {
    return { found: false, error: 'No connecting transit path could be computed.' };
  }

  // Reconstruct transit itinerary and compute physical metrics
  let totalTime = 0;
  let totalDistance = 0;
  let interchanges = 0;
  const steps = [];
  const visitedStationsSet = new Set();
  const pathStations = [];

  for (let i = 0; i < bestPath.length; i++) {
    const u = bestPath[i];
    const nodeU = nodes[u];
    visitedStationsSet.add(nodeU.station);
    pathStations.push(nodeU.station);

    if (i === 0) {
      steps.push({
        station: nodeU.station,
        line: nodeU.line,
        time: 0,
        dist: 0,
        isTransfer: false,
        note: `Board ${nodeU.line} Line at ${nodeU.station}`
      });
      continue;
    }

    const prev = bestPath[i - 1];
    const nodePrev = nodes[prev];

    // Find connecting edge
    const edgesFromPrev = adjacency[prev] || [];
    let edgeTime = 0;
    let edgeDist = 0;
    let isTransfer = false;

    for (const edge of edgesFromPrev) {
      if (edge.to === u) {
        edgeTime = edge.time;
        edgeDist = edge.dist;
        isTransfer = edge.isTransfer;
        break;
      }
    }

    totalTime += edgeTime;
    totalDistance += edgeDist;

    if (isTransfer || nodePrev.line !== nodeU.line) {
      interchanges++;
      steps.push({
        station: nodeU.station,
        line: nodeU.line,
        prevLine: nodePrev.line,
        time: edgeTime,
        dist: edgeDist,
        isTransfer: true,
        note: `Change here from ${nodePrev.line} Line to ${nodeU.line} Line (~${edgeTime} min walk)`
      });
    } else {
      steps.push({
        station: nodeU.station,
        line: nodeU.line,
        time: edgeTime,
        dist: edgeDist,
        isTransfer: false,
        note: ''
      });
    }
  }

  return {
    found: true,
    source: sourceStation,
    destination: destStation,
    mode,
    totalTime,
    totalDistance: Number(totalDistance.toFixed(2)),
    interchanges,
    stationCount: visitedStationsSet.size,
    steps,
    pathNodeIds: bestPath,
    pathStations
  };
}
