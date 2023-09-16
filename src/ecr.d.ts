import { Handle } from "./Handle";
import { View } from "./View";
import { Observer } from "./Observer";
import { Group } from "./Group";
import { Queue, QueueableSignal } from "./Queue";

export {
	Handle,
	View,
	Observer,
	Group,
	Queue,
}

export type Entity = number & {
	/**
	 * Do not use. Only for type metadata.
	 * @hidden
	 * @deprecated
	 */
	readonly _nominal_ecr_entity: unique symbol;
};

export type Component<T = unknown> = number & {
	/**
	 * Do not use. Only for type metadata.
	 * @hidden
	 * @deprecated
	 */
	readonly _nominal_ecr_component_type: T 
};

export type ComponentArray<T extends unknown[] = unknown[]> = {
	[index in keyof T]: Component<T[index]>;
};

/**
 * ECR Connection class
 */
export interface Connection {
	/**
	 * Disconnects a listener from a signal.
	 * 
	 * @remarks
	 * 
	 * Disconnecting a listenener from within itself is allowed.
	 * 
	 * **WARNING**
	 * 
	 * Disconnecting other listeners from within a listener may result in undefined behavior. 
	 * 
	 */
	disconnect(this: Connection): void;

	/**
	 * Reconnects a listener to a signal.
	 */
	reconnect(this: Connection): void;
}

/**
 * ECR Signal class.
 */
export interface Signal<T extends unknown[]> {
	/**
	 * Connects a given function to the signal to be called whenever the signal is fired.
	 * 
	 * @remarks
	 * 
	 * New connections made within a listener will not be ran until the next time the signal is fired.
	 */
	connect(this: Signal<T>, listener: (...args: T) => void): Connection;
}

type Listener<T = undefined> = T extends undefined ? (id: Entity) => void : (id: Entity, value: T) => void;

interface GroupData<T = unknown> {
	size: number;

	/**
	 * flag used to detect iter invalidation
	 */
	added: boolean;

	connections: Array<Connection>;

	[key: number]: Pool<T>
}

/**
 * The core data structure used by the registry internally to store entities and component values for each component type.
 */
interface Pool<T> {
	/**
	 * The amount of entities contained in the pool.
	 */
	size: number;

	/**
	 * Sparse array, maps entity key to internal index.
	 */
	map: Array<number | undefined>;

	/**
	 * An array of all entities with the given component type.
	 * 
	 * @remarks
	 * 
	 * Sorted in the same order as Pool.values.
	 * 
	 * `entities[n]`'s component value is located at `values[n]`
	 */
	entities: Array<Entity>;

	/**
	 * An array of all values for the given component type.
	 * 
	 * @remarks
	 * 
	 * Sorted in the same order as Pool.entities.
	 */
	values: Array<T>;

	added: Array<Listener<T>> | false;
	changed: Array<Listener<T>> | false;
	removing: Array<Listener> | false;
	group: GroupData<T> | false;

	set(this: Pool<T>, id: Entity, value: T): void;
	get(this: Pool<T>, id: Entity): T | undefined;
	has(this: Pool<T>, id: Entity): boolean;
	remove(this: Pool<T>, id: Entity): void;
	reserve(this: Pool<T>, size: number): void;
}




export interface Registry {
	/**
	 * Creates a new entity
	 * 
	 * @remarks
	 * 
	 * All ids returned are guaranteed to be unique unless an old id is explicitly reused
	 * 
	 * An entity can be created using a specific id that was created by another registry or previously by the same registry. Will error if it is unable to do so.
	 * 
	 * **WARNING**
	 * 
	 * Reusing an old identifier previously returned by this registry will no longer guarantee new identifiers returned to be unique.
	 * 
	 * The total amount of entities in a registry at any given time cannot exceed `1,048,575`. Attempting to exceed this limit will throw an error.
	 * 
	 * @returns The entity's identifier
	 */
	create(this: Registry, id: Entity): Entity;

	/**
	 * Creates a new entity
	 * 
	 * @remarks
	 * 
	 * All ids returned are guaranteed to be unique unless an old id is explicitly reused
	 * 
	 * An entity can be created using a specific id that was created by another registry or previously by the same registry. Will error if it is unable to do so.
	 * 
	 * **WARNING**
	 * 
	 * Reusing an old identifier previously returned by this registry will no longer guarantee new identifiers returned to be unique.
	 * 
	 * The total amount of entities in a registry at any given time cannot exceed `1,048,575`. Attempting to exceed this limit will throw an error.
	 * 
	 * @returns The entity's identifier
	 */
	create(this: Registry): Entity;

	/**
	 * Removes the entity from the registry.
	 * 
	 * **DANGER**
	 * 
	 * This method does not remove any of the entity's components. If it is not known that an entity has components, use `Registry.destroy()` instead. 
	 * 
	 * Using this method on an entity that still has components will result in undefined behavior.
	 */
	release(this: Registry, id: Entity): void;

	/**
	 * Removes the entity from the registry and removes all of its components.
	 */
	destroy(this: Registry, id: Entity): void;

	/**
	 * Checks if the given entity exists in the registry.
	 */
	contains(this: Registry, id: Entity): boolean;

	/**
	 * Checks if the given entity has no components.
	 * 
	 * @remarks
	 * 
	 * An entity is considered an orphan if it has no components.
	 */
	orphaned(this: Registry, id: Entity): boolean;

	/**
	 * Adds all components specified to an entity.
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
	add(this: Registry, id: Entity, ...components: ComponentArray): void;

	/**
	 * Sets an entity's component.
	 * 
	 * @remarks
	 * 
	 * Adds the component to the entity with the given value if the entity does not already have the component.
	 * 
	 * Changes the component value for the given entity if the entity already has the component.
	 * 
	 * Will error if value is `undefined`
	 */
	set<T>(this: Registry, id: Entity, component: Component<T>, value: T): void;

	/**
	 * Updates an entity's component.
	 * 
	 * @remarks
	 * 
	 * Takes a callback which is given the current component value as the only argument. The value returned by the callback is then set as the new value.
	 * 
	 * If there is a constructor defined for the given component and the entity does not have the component, the constructor will be called and the returned value passed into the callback.
	 * 
	 * **WARNING**
	 * 
	 * Attempting to patch a component that an entity does not have and that has no constructor will throw an error.
	 */
	patch<T>(this: Registry, id: Entity, component: Component<T>, patcher: (oldValue: T) => T): void;

	/**
	 * Checks if an entity has all of the given components.
	 * 
	 * @remarks
	 * 
	 * Will return `true` only if the entity has every component specified.
	 */
	has(this: Registry, id: Entity, ...components: ComponentArray): boolean;

	/**
	 * Gets an entity's component values.
	 * 
	 * @remarks
	 * 
	 * Will error if the entity does not have a component.
	 */
	get<T extends unknown[]>(this: Registry, id: Entity, ...components: ComponentArray<T>): LuaTuple<T>;

	/**
	 * Gets an entity's component value.
	 * 
	 * @remarks
	 * 
	 * Will return `undefined` if the entity does not have a component.
	 */
	try_get<T>(this: Registry, id: Entity, component: Component<T>): T | undefined;

	/**
	 * Removes the given components from an entity.
	 * 
	 * @remarks
	 * 
	 * Will do nothing if the entity does not have a component.
	 */
	remove(this: Registry, id: Entity, ...components: ComponentArray): void;

	/**
	 * Creates a [view](https://centau.github.io/ecr/api/View.html) for all entities with the specified components.
	 * 
	 * @remarks
	 * 
	 * Creates a new view with the given components.
	 * 
	 * Entities in the view are guaranteed to have at least all of the given components.
	 */
	view<T extends unknown[]>(this: Registry, ...components: ComponentArray<T>): View<T>;

	/**
	 * Creates an [observer](https://centau.github.io/ecr/api/Observer.html) which records changes that occur for a given component.
	 * 
	 * @remarks
	 * 
	 * Tracks all components in the argument list.
	 * 
	 * The observer will only return entities that:
	 * 
	 * 1. Have had any component in the argument list added or changed since the last iteration.
	 * 2. Have all components specified at the time of iteration.
	 * 
	 * When an observer is first created, it treats all current entities with the given components in the registry as newly changed.
	 * 
	 * **WARNING**
	 * 
	 * After iterating over an observer and processing the changes, call `Observer.clear()` to clear all changes so you do not reprocess the same changes again.
	 */
	track<T extends unknown[]>(this: Registry, ...components: ComponentArray<T>): Observer<T>;

	/**
	 * [Groups](https://centau.github.io/ecr/api/Group.html) the given components.
	 * 
	 * @remarks
	 * 
	 * Rearranges the internal storage of components for better iteration performance when iterated together.
	 * 
	 * Groups must be mutually exclusive, i.e. each component type can only belong to a single group. Will error if this occurs.
	 * 
	 * **WARNING**
	 * 
	 * This method introduces restrictions on adding components during views. Read them [here](https://centau.github.io/ecr/tut/groups.html#limitations).
	 */
	group<T extends unknown[]>(this: Registry, ...components: ComponentArray<T>): Group<T>;

	/**
	 * Removes all entities and components from the registry.
	 * 
	 * @remarks
	 * 
	 * If components are specified, removes all components given from all entities that have that component without destroying the entities.
	 * 
	 * If no components are specified, then all entities in the registry will be destroyed.
	 */
	clear(this: Registry, ...components: ComponentArray): void;

	/**
	 * Returns a [pool](https://centau.github.io/ecr/api/Pool.html) containing every entity and corresponding value for a given component
	 */
	storage<T>(this: Registry, component: Component<T>): Pool<T>;

	/**
	 * Returns a [signal](https://centau.github.io/ecr/api/Signal.html) which is fired whenever the given component is added to an entity.
	 * 
	 * @remarks
	 * 
	 * The signal is fired after the component is changed.
	 * 
	 * **WARNING**
	 * 
	 * Components cannot be added or removed within a listener.
	 */
	added<T>(this: Registry, component: Component<T>): Signal<[Entity, T]>;

	/**
	 * Returns a [signal](https://centau.github.io/ecr/api/Signal.html) which is fired whenever the given component's value is changed for an entity.
	 * 
	 * @remarks
	 * 
	 * The signal is fired after the component is changed.
	 * 
	 * **WARNING**
	 * 
	 * Components cannot be added or removed within a listener.
	 */
	changed<T>(this: Registry, component: Component<T>): Signal<[Entity, T]>;

	/**
	 * Returns a [signal](https://centau.github.io/ecr/api/Signal.html) which is fired whenever the given component is being removed from an entity.
	 * 
	 * @remarks
	 * 
	 * The signal is fired before the component is actually removed. You can retrieve the component value within the signal listener.
	 * 
	 * **WARNING**
	 * 
	 * Components cannot be added or removed within a listener.
	 */
	removing(this: Registry, component: Component): Signal<[Entity]>;

	/**
	 * Returns a [handle](https://centau.github.io/ecr/api/Handle.html) to an entity.
	 * 
	 * @remarks
	 * 
	 * If no entity is given then a new one is created.
	 */
	handle(this: Registry, id: Entity): Handle;

	/**
	 * Returns a [handle](https://centau.github.io/ecr/api/Handle.html) to an entity.
	 * 
	 * @remarks
	 * 
	 * If no entity is given then a new one is created.
	 */
	handle(this: Registry): Handle;

	/**
	 * Returns a [handle](https://centau.github.io/ecr/api/Handle.html) to a special context entity.
	 * 
	 * @remarks
	 * 
	 * The context is a special entity that always exists and cannot be destroyed. Components added to it will still be returned by views and fire signals.
	 * 
	 * The purpose of the context is to store components that are not specific to entities but instead are concerned with the world itself.
	 * 
	 * Examples of when this can be used is to store data such as time, gravity, difficulty, etc.
	 * 
	 * The same context entity handle is always returned when called.
	 */
	context(this: Registry): Handle;
}

export namespace ecr {
	/**
	 * A special component type that refers to the registry entity pool.
	 * 
	 * @example
	 * View all entities:
	 * ```
	 * registry.view(ecr.entity)
	 * ```
	 * Listen to entity creation:
	 * ```
	 * registry.added(ecr.entity).connect(() => {})
	 * ```
	 */
	export const entity: Component;

	/**
	 * A null entity.
	 * 
	 * This id behaves like the id of an entity that has been destroyed.
	 * 
	 * Attempting to add or remove components using this id will error.
	 * 
	 * @example
	 * The following expression will always return false:
	 * ```
	 * registry.contains(ecr.null)
	 * ```
	 */
	export const null_id: Entity;

	/**
	 * Creates a new registry.
	 */
	export function registry(): Registry;

	/**
	 * Creates a new component type.
	 * @param constructor Invoked when `registry.add()` or `registry.patch()` is used.
	 * @example
	 * ```
	 * const Health = ecr.component(() => {
	 *     return { Current: 100, Max: 100 };
	 * })
	 * 
	 * const Position = ecr.component(() => Vector3.zero);
	 * ```
	 * @returns A unique identifier representing a new component type.
	 */
	export function component<T>(constructor: () => T): Component<T>;

	/**
	 * Creates a new component type.
	 * @example
	 * ```
	 * const Health = ecr.component<number>();
	 * const Model = ecr.component<Model>();
	 * ```
	 * @returns A unique identifier representing a new component type.
	 */
	export function component<T>(): Component<T>;

	/**
	 * Creates a new valueless component type.
	 * 
	 * @remarks
	 * Tag components are a special type of component where no value is stored alongside.
	 * 
	 * Use `add()` to add tags to entities. `set()` will not apply the valueless optimization. `get()` will return `undefined` so use `has()` instead.
	 * @returns A unique identifier representing a new component type.
	 */
	export function tag(): Component<undefined>

	/**
	 * Checks if a component type is a tag.
	 */
	export function is_tag(component: Component): boolean;

	/**
	 * Associates names with components for debugging.
	 * 
	 * @remarks
	 * Allows for errors raised to display the component name instead of its argument list position.
	 * 
	 * @returns The same record given and is also readonly.
	 */
	export function name<T extends Record<string, Component>>(names: T): Readonly<T>;

	/**
	 * Creates a new queue.
	 * @param signal Will automatically connect a callback where any values passed into the callback will automatically be queued.
	 */
	export function queue<T extends unknown[]>(signal: QueueableSignal<T>): Queue<T>;

	/**
	 * Creates a new queue.
	 */
	export function queue<T extends unknown[]>(): Queue<T>;

	export function extract(entity: Entity): LuaTuple<[number, number]>;
}

export default ecr;