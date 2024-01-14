import { Entity, ComponentArray, Component } from "./ecr";

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

	/**
	 * Specifies a component to iterate along.
	 * 
	 * @remarks
	 * 
	 * Views, by default, iterate along the smallest pool within the given set of components. 
	 * 
	 * This function allows a specific pool to be iterated along instead as long as the component is included in the view.
	 * 
	 * @returns The same view that it was called on.
	 */
	use(this: View<T>, lead: Component): View<T>;
};