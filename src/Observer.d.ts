import { Entity, ComponentArray } from "./ecr";

/**
 * Observers are used to track component changes.
 * 
 * The observer records changed components that can be iterated over and cleared at will.
 * 
 * **Iteration**
 * 
 * Observers support iteration.
 * 
 * The entity id followed by the group components are returned.
 * 
 * Components can be added, changed and removed during iteration. Newly added components and their entities will not be returned until the next iteration.
 * 
 * Will automatically clear the observer unless Observer.persist() was called.
 * 
 * **WARNING**
 * 
 * Adding values during iteration can cause them to be cleared when iteration completes and they will never be iterated.
 * 
 * During iteration, adding or removing components from entities not currently being iterated can invalidate the iterator.
 * 
 * Clearing during iteration can result in an error.
 */
export type Observer<T extends unknown[]> = IterableFunction<LuaTuple<[Entity, ...T]>> & {
	// TS EXCLUSIVE
	/**
	 * Returns the amount of entities in the observer.
	 */
	size(this: Observer<T>): number;

	/**
	 * Excludes entities with the given components from the observer.
	 * 
	 * @remarks
	 * 
	 * Any entities encountered with any of the excluded components, will not be returned during iteration.
	 * 
	 * @returns The same observer that it was called on.
	 */
	exclude(this: Observer<T>, ...components: ComponentArray): Observer<T>;

	/**
	 * Disconnects the observer, stopping any new changes from being tracked
	 * 
	 * **WARNING**
	 * 
	 * This must be called for the observer to be garbage collected.
	 * 
	 * @returns The same observer that it was called on.
	 */
	disconnect(this: Observer<T>): Observer<T>;

	/**
	 * Reconnects the Observer and allows it to track future changes again.
	 * 
	 * @returns The same observer that it was called on.
	 */
	reconnect(this: Observer<T>): Observer<T>;

	/**
	 * Stops automatic clearing of the observer.
	 * 
	 * @remarks
	 * 
	 * Stops the observer from automatically clearing after it is iterated.
	 * 
	 * @returns The same observer that it was called on.
	 */
	persist(this: Observer<T>): Observer<T>;

	/**
	 * Clears all recorded changes.
	 * 
	 * Use to clear all recorded changes after they have been processed to avoid reprocessing the same changes again later.
	 * 
	 * @returns The same observer that it was called on.
	 */
	clear(this: Observer<T>): Observer<T>;
};