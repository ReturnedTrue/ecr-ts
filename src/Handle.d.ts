import { Entity, ComponentArray, Component, Registry } from "./ecr";

/**
 * Thin wrapper around an entity and its registry.
 */
export interface Handle {
	/**
	 * The registry the entity belongs to.
	 */
	registry: Registry;

	/**
	 * The entity the handle refers to.
	 */
	entity: Entity;

	/**
	 * Removes the handle's entity from the registry and removes all of its components.
	 */
	destroy(this: Handle): void;

	/**
	 * Checks if the handle's entity has no components.
	 */
	has_none(this: Handle): boolean;

	/**
	 * Adds all components specified to the handle's entity
	 * 
	 * @remarks
	 * 
	 * Adds the given components to the entity by calling each component constructor or assigning no value at all if the component is a tag type.
	 * 
	 * Adding a component to an entity that already has the component will do nothing.
	 * 
	 * **WARNING**
	 * 
	 * Attempting to add components with this method that do not have constructors will error.
	 */
	add(this: Handle, ...components: ComponentArray): void;

	/**
	 * Sets the entity's component.
	 * 
	 * @remarks 
	 * 
	 * Adds the component to the entity with the given value if the entity does not already have the component.
	 * 
	 * Changes the component value for the given entity if the entity already has the component.
	 * 
	 * Will error if value is `undefined`.
	 */
	set<T>(this: Handle, component: Component<T>, value: T): Handle;

	/**
	 * Updates the entity's component.
	 * 
	 * @remarks
	 * 
	 * Takes a callback which is given the current component value as the only argument. The value returned by the callback is then set as the new value.
	 * 
	 * If there is a constructor defined for the given component and the entity does not have the component, the constructor will be called and the returned value passed into the callback.
	 * 
	 * @example
	 * 
	 * ```
	 * handle.patch(Health, (health) => health - 10)
	 * ```
	 */
	patch<T>(this: Handle, component: Component<T>, patcher: (current: T) => T): void;

	/**
	 * Checks if the handle's entity has all of the given components.
	 * 
	 * @returns `true` only if the entity has every component specified.
	 */
	has(this: Handle, ...components: ComponentArray): void;

	/**
	 * Gets the entity's component values.
	 * 
	 * @throws If the entity does not have a component.
	 */
	get<T extends unknown[]>(this: Handle, ...components: ComponentArray<T>): LuaTuple<T>;

	/**
	 * Gets the entity's component value.
	 * 
	 * @returns `undefined` if the entity does not have a component.
	 */
	try_get<T>(this: Handle, component: Component<T>): T | undefined;

	/**
	 * Removes the given components from the handle's entity.
	 * 
	 * @remarks
	 * 
	 * Will do nothing if the entity does not have a component.
	 */
	remove(this: Handle, ...components: ComponentArray): void;
}