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

type ComponentArray<T extends unknown[] = unknown[]> = {
	[index in keyof T]: Component<T[index]>;
};

export interface Connection {
	disconnect(this: Connection): void;
	reconnect(this: Connection): void;
}

export interface Signal<T extends unknown[]> {
	connect(this: Signal<T>, listener: (...args: T) => void): Connection;
}

export interface Handle {
	registry: number;
	entity: Entity;

	destroy(this: Handle): void;
	orphaned(this: Handle): boolean;
	add(this: Handle, ...components: ComponentArray): void;
	set<T>(this: Handle, component: Component<T>, value: T): Handle;
	patch<T>(this: Handle, component: Component<T>, patcher: (current: T) => T): void;
	has(this: Handle, ...components: ComponentArray): void;
	get<T extends unknown[]>(this: Handle, ...components: ComponentArray<T>): LuaTuple<T>;
	try_get<T>(this: Handle, component: Component<T>): T | undefined;
	remove(this: Handle, ...components: ComponentArray): void;
}

type IterableObject<T extends object, U extends unknown[]> = T & IterableFunction<LuaTuple<U>>;

export type View<T extends unknown[]> = IterableObject<{
	// TS EXCLUSIVE
	size(this: View<T>): number;

	exclude(this: View<T>, ...components: ComponentArray): View<T>;
	use(this: View<T>, lead: Component): View<T>;
}, [Entity, ...T]>;

export type Observer<T extends unknown[]> = IterableObject<{
	// TS EXCLUSIVE
	size(this: Observer<T>): number;

	exclude(this: Observer<T>, ...components: ComponentArray): Observer<T>;
	disconnect(this: Observer<T>): Observer<T>;
	reconnect(this: Observer<T>): Observer<T>;

	persist(this: Observer<T>): Observer<T>;
	clear(this: Observer<T>): Observer<T>;
}, [Entity, ...T]>;

export type Group<T extends unknown[]> = IterableObject<{
	// TS EXCLUSIVE
	size(this: Group<T>): number;
}, [Entity, ...T]>;

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

interface Pool<T> {
	/**
	 * amount of entities in pool
	 */
	size: number;

	/**
	 * sparse array, maps entity key to internal index
	 */
	map: Array<number | undefined>;

	/**
	 * all entity ids
	 */
	entities: Array<Entity>;

	/**
	 * all corresponding componentvalues
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

type QueueableSignal<T extends unknown[]> = {
	connect(this: QueueableSignal<T>, ...args: T): void;
} | {
	Connect(this: QueueableSignal<T>, ...args: T): void;
};

export type Queue<T extends unknown[]> = IterableObject<{
	// TS EXCLUSIVE
	size(this: Queue<T>): number;

	add(this: Queue<T>, ...args: T): void;
	clear(this: Queue<T>): void;
}, T>;

export interface Registry {
	create(this: Registry, id: Entity): Entity;
	create(this: Registry): Entity;
	release(this: Registry, id: Entity): void;
	destroy(this: Registry, id: Entity): void;
	contains(this: Registry, id: Entity): boolean;

	orphaned(this: Registry, id: Entity): boolean;
	add(this: Registry, id: Entity, ...components: ComponentArray): void;
	set<T>(this: Registry, id: Entity, component: Component<T>, value: T): void;
	patch<T>(this: Registry, id: Entity, component: Component<T>, patcher: (oldValue: T) => T): void;
	has(this: Registry, id: Entity, ...components: ComponentArray): boolean;
	get<T extends unknown[]>(this: Registry, id: Entity, ...components: ComponentArray<T>): LuaTuple<T>,
	try_get<T>(this: Registry, id: Entity, component: Component<T>): T | undefined,
	remove(this: Registry, id: Entity, ...components: ComponentArray): void,

	view<T extends unknown[]>(this: Registry, ...components: ComponentArray<T>): View<T>;
	track<T extends unknown[]>(this: Registry, ...components: ComponentArray<T>): Observer<T>;
	group<T extends unknown[]>(this: Registry, ...components: ComponentArray<T>): Group<T>;

	clear(this: Registry, ...components: ComponentArray): void,
	storage<T>(this: Registry, component: Component<T>): Pool<T>

	added<T>(this: Registry, component: Component<T>): Signal<[Entity, T]>,
	changed<T>(this: Registry, component: Component<T>): Signal<[Entity, T]>,
	removing(this: Registry, component: Component): Signal<[Entity]>,

	handle(this: Registry, id: Entity): Handle;
	handle(this: Registry): Handle;
	context(this: Registry): Handle;
}

export namespace ecr {
	export const entity: Component;
	export const null_id: Entity;

	export function registry(): Registry;
	export function component<T>(constructor: () => T): Component<T>;
	export function component<T>(): Component<T>;
	export function tag(): undefined
	export function is_tag(component: Component): boolean;
	export function name<T extends Record<string, Component>>(names: T): Readonly<T>;
	export function queue<T extends unknown[]>(signal: QueueableSignal<T>): Queue<T>;
	export function queue<T extends unknown[]>(): Queue<T>;
	export function extract(entity: Entity): LuaTuple<[number, number]>;
}

export default ecr;