export type QueueableSignal<T extends unknown[]> = {
	connect(this: QueueableSignal<T>, callback: (...args: T) => unknown): void;
} | {
	Connect(this: QueueableSignal<T>, callback: (...args: T) => unknown): void;
};

/**
 * Queues values to be processed later.
 * 
 * **Iteration**
 * 
 * Queues support iteration.
 * 
 * The queue returns in sets of values passed to `Queue.add()` in the same order it was called in.
 * 
 * Values added during iteration are not returned.
 * 
 * The queue automatically clears itself after iteration.
 * 
 * **WARNING**
 * 
 * Adding values during iteration will cause them to be cleared when iteration completes and they will never be iterated.
 * 
 * Clearing during iteration can result in an error.
 */
export type Queue<T extends unknown[]> = IterableFunction<LuaTuple<T>> & {
	/**
	 * The amount of values in the queue
	 */
	size: number;

	/**
	 * Adds a set of values to a queue.
	 * 
	 * @remarks
	 * 
	 * Each time this method is called, the size of the queue increases by one.
	 * 
	 * All arguments given are later returned altogether in the same iteration.
	 * 
	 * Queues are FIFO.
	 * 
	 * **WARNING**
	 * 
	 * The first value in the argument list cannot be nil since that will cause iteration to stop early.
	 */
	add(this: Queue<T>, ...args: T): void;

	/**
	 * Clears the queue.
	 */
	clear(this: Queue<T>): void;
};