import { Entity } from "./ecr";

/**
 * Groups are used to efficiently iterate over a set of components.
 * 
 * **Iteration**
 * 
 * Groups support iteration.
 * 
 * The entity id followed by the group components are returned.
 * 
 * Components can be added, changed and removed during iteration. Newly added components and their entities will not be returned until the next iteration.
 * 
 * **WARNING**
 * 
 * During iteration, adding or removing components from entities not currently being iterated can invalidate the iterator.
 */
export type Group<T extends unknown[]> = IterableFunction<LuaTuple<[Entity, ...T]>> & {
	// TS EXCLUSIVE
	size(this: Group<T>): number;
};