/**
 * Min-Heap Priority Queue implemented from scratch for Dijkstra, A*, and Greedy Best-First Search.
 * Guarantees O(log N) insert and extract-min operations.
 */
export interface PQNode<T> {
  item: T;
  priority: number;
  insertOrder: number; // For stable tie-breaking if needed
}

export class PriorityQueue<T> {
  private heap: PQNode<T>[] = [];
  private orderCounter = 0;

  constructor() {}

  public push(item: T, priority: number): void {
    const node: PQNode<T> = {
      item,
      priority,
      insertOrder: ++this.orderCounter,
    };
    this.heap.push(node);
    this.siftUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const minNode = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.siftDown(0);
    }
    return minNode.item;
  }

  public peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0].item : undefined;
  }

  public peekPriority(): number | undefined {
    return this.heap.length > 0 ? this.heap[0].priority : undefined;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public clear(): void {
    this.heap = [];
    this.orderCounter = 0;
  }

  private siftUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.heap[current], this.heap[parent]) < 0) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const length = this.heap.length;
    let current = index;

    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let smallest = current;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== current) {
        this.swap(current, smallest);
        current = smallest;
      } else {
        break;
      }
    }
  }

  private compare(a: PQNode<T>, b: PQNode<T>): number {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Tie-breaker: earlier inserted element comes first (FIFO for equal priority)
    return a.insertOrder - b.insertOrder;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
