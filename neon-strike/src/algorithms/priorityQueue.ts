/**
 * Binary Min-Heap Priority Queue implemented from scratch in TypeScript.
 * Used by Dijkstra, A*, and Greedy Best-First Search.
 */
export interface PriorityQueueItem<T> {
  item: T;
  priority: number;
}

export class MinPriorityQueue<T> {
  private heap: PriorityQueueItem<T>[] = [];

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0].item : undefined;
  }

  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (element.priority >= parent.priority) break;
      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let swapIndex: number | null = null;

      if (leftChildIndex < length) {
        if (this.heap[leftChildIndex].priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        if (
          (swapIndex === null && this.heap[rightChildIndex].priority < element.priority) ||
          (swapIndex !== null && this.heap[rightChildIndex].priority < this.heap[leftChildIndex].priority)
        ) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) break;

      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
