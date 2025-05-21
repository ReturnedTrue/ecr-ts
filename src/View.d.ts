import { Entity, ComponentArray} from "./ecr";

/**
 * Iterator for viewing entities and components in a registry.
 * 
 * **Iteration**
 * 
 * Views support iteration.
 * 
 * The entity id followed by the specified components are returned.
 * 
 * Components can be added, changed and removed during iteration. 
 * 
 * Newly added components and their entities will not be returned until the next iteration.
 * 
 * **WARNING**
 * 
 * During iteration, adding or removing components from entities not currently being iterated can invalidate the iterator.
 */
export type View<T extends unknown[]> = IterableFunction<LuaTuple<[Entity, ...T]>> & {
	// TS EXCLUSIVE
	/** 
	 * Returns the amount of entities in the view.
	 * 
	 * @remarks
	 * 
	 * For single component views, this returns the exact amount of entities in the view.
	 * 
	 * For multiple component views, this returns an estimated amount of entities. This estimate will never be less than the actual amount of entities.
	*/
	size(this: View<T>): number;

	/**
	 * Excludes entities with the given components from the view.
	 * 
	 * @remarks
	 * 
	 * Entities with any of the excluded components, will not be returned during iteration.
	 * 
	 * @returns The same view that it was called on.
	 */
	exclude(this: View<T>, ...components: ComponentArray): View<T>;
} & (T extends [infer U] ? {
	/**
	 * Updates each entity in the view by changing the component value from the given in the callback, to the callback's return
	 */
	patch(this: View<T>, fn: (from: U) => U): void;
} : {
	/**
	 * Updates each entity in the view by changing the components values from the given in the callback, to the callback's returns
	 */
	patch(this: View<T>, fn: (...from: T) => LuaTuple<T>): void;
});
