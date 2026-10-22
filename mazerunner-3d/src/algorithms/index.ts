import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { AlgorithmDetails, AlgorithmResult, AlgorithmType } from './algorithmTypes';
import { runAStar } from './astar';
import { runBFS } from './bfs';
import { runDFS } from './dfs';
import { runDijkstra } from './dijkstra';
import { runGreedyBestFirst } from './greedyBestFirst';

export * from './algorithmTypes';
export * from './astar';
export * from './bfs';
export * from './dfs';
export * from './dijkstra';
export * from './graph';
export * from './greedyBestFirst';
export * from './priorityQueue';

export function runAlgorithm(
  type: AlgorithmType,
  maze: MazeGrid,
  start: Point2D,
  target: Point2D
): AlgorithmResult {
  switch (type) {
    case 'BFS':
      return runBFS(maze, start, target);
    case 'DFS':
      return runDFS(maze, start, target);
    case 'DIJKSTRA':
      return runDijkstra(maze, start, target);
    case 'ASTAR':
      return runAStar(maze, start, target);
    case 'GREEDY_BEST_FIRST':
      return runGreedyBestFirst(maze, start, target);
    default:
      throw new Error(`Unknown algorithm type: ${type}`);
  }
}

export const ALGORITHM_DETAILS: Record<AlgorithmType, AlgorithmDetails> = {
  BFS: {
    name: 'BFS',
    fullName: 'Breadth-First Search',
    dataStructure: 'FIFO Queue',
    timeComplexity: 'O(|V| + |E|)',
    spaceComplexity: 'O(|V|)',
    optimality: 'Optimal (unweighted shortest path)',
    completeness: 'Complete (always finds path if one exists)',
    description:
      'Explores the labyrinth level-by-level, expanding all nodes at distance k before moving to distance k+1. Guarantees finding the route with the minimum number of steps in unweighted grids.',
    pseudocode: `function BFS(start, goal):
  queue = new Queue()
  visited = new Set([start])
  parent = new Map()
  
  queue.enqueue(start)
  
  while not queue.isEmpty():
    current = queue.dequeue()
    if current == goal:
      return reconstructPath(parent, start, goal)
      
    for neighbor in getWalkableNeighbors(current):
      if neighbor not in visited:
        visited.add(neighbor)
        parent[neighbor] = current
        queue.enqueue(neighbor)
        
  return null // Unreachable`,
  },
  DFS: {
    name: 'DFS',
    fullName: 'Depth-First Search',
    dataStructure: 'LIFO Stack',
    timeComplexity: 'O(|V| + |E|)',
    spaceComplexity: 'O(|V|)',
    optimality: 'Not Optimal (can take long winding detours)',
    completeness: 'Complete (in finite graphs)',
    description:
      'Explores as deeply as possible along each branch before backtracking. Often finds very long, winding paths in labyrinths with loops, making it an excellent demonstration of non-optimal pathfinding.',
    pseudocode: `function DFS(start, goal):
  stack = new Stack([start])
  visited = new Set()
  parent = new Map()
  
  while not stack.isEmpty():
    current = stack.pop()
    if current in visited: continue
    visited.add(current)
    
    if current == goal:
      return reconstructPath(parent, start, goal)
      
    for neighbor in getWalkableNeighbors(current):
      if neighbor not in visited:
        if neighbor not in parent:
          parent[neighbor] = current
        stack.push(neighbor)
        
  return null // Unreachable`,
  },
  DIJKSTRA: {
    name: 'Dijkstra',
    fullName: "Dijkstra's Algorithm",
    dataStructure: 'Min-Heap Priority Queue',
    timeComplexity: 'O((|V| + |E|) log |V|)',
    spaceComplexity: 'O(|V|)',
    optimality: 'Optimal (minimum traversal cost with non-negative weights)',
    completeness: 'Complete',
    description:
      'Systematically expands outward in order of accumulated movement cost g(n). Finds the minimum-cost route even across difficult sludge (cost 3) or hazard tiles (cost 5).',
    pseudocode: `function Dijkstra(start, goal):
  pq = new PriorityQueue() // ordered by g(n)
  dist = new Map()
  parent = new Map()
  
  dist[start] = 0
  pq.push(start, 0)
  
  while not pq.isEmpty():
    current = pq.pop()
    if current == goal:
      return reconstructPath(parent, start, goal)
      
    for neighbor in getWalkableNeighbors(current):
      newCost = dist[current] + cost(current, neighbor)
      if newCost < dist.get(neighbor, Infinity):
        dist[neighbor] = newCost
        parent[neighbor] = current
        pq.push(neighbor, newCost)
        
  return null`,
  },
  ASTAR: {
    name: 'A*',
    fullName: 'A* Heuristic Search',
    dataStructure: 'Min-Heap Priority Queue',
    timeComplexity: 'O((|V| + |E|) log |V|)',
    spaceComplexity: 'O(|V|)',
    optimality: 'Optimal (with admissible heuristic)',
    completeness: 'Complete',
    description:
      'Combines actual cost from start g(n) with estimated Manhattan distance to goal h(n): f(n) = g(n) + h(n). Drastically cuts down explored cells compared to Dijkstra while guaranteeing an optimal path.',
    pseudocode: `function AStar(start, goal):
  pq = new PriorityQueue() // ordered by f(n) = g(n) + h(n)
  gCost = new Map()
  parent = new Map()
  closed = new Set()
  
  gCost[start] = 0
  pq.push(start, h(start, goal))
  
  while not pq.isEmpty():
    current = pq.pop()
    if current in closed: continue
    closed.add(current)
    
    if current == goal:
      return reconstructPath(parent, start, goal)
      
    for neighbor in getWalkableNeighbors(current):
      if neighbor in closed: continue
      newG = gCost[current] + cost(current, neighbor)
      if newG < gCost.get(neighbor, Infinity):
        gCost[neighbor] = newG
        parent[neighbor] = current
        f = newG + h(neighbor, goal)
        pq.push(neighbor, f)
        
  return null`,
  },
  GREEDY_BEST_FIRST: {
    name: 'Greedy Best-First',
    fullName: 'Greedy Best-First Search',
    dataStructure: 'Min-Heap Priority Queue',
    timeComplexity: 'O((|V| + |E|) log |V|)',
    spaceComplexity: 'O(|V|)',
    optimality: 'Not Optimal (heuristic can mislead)',
    completeness: 'Complete (with visited checking)',
    description:
      'Prioritizes nodes purely by estimated proximity to goal h(n). Runs very fast in open corridors, but easily gets trapped into dead-end cul-de-sacs that point directly at the exit, leading to suboptimal solutions.',
    pseudocode: `function GreedyBestFirst(start, goal):
  pq = new PriorityQueue() // ordered by h(n) alone
  visited = new Set([start])
  parent = new Map()
  
  pq.push(start, h(start, goal))
  
  while not pq.isEmpty():
    current = pq.pop()
    if current == goal:
      return reconstructPath(parent, start, goal)
      
    for neighbor in getWalkableNeighbors(current):
      if neighbor not in visited:
        visited.add(neighbor)
        parent[neighbor] = current
        pq.push(neighbor, h(neighbor, goal))
        
  return null`,
  },
};
