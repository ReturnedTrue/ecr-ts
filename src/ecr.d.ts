export type Entity = number;
type ComponentType = unknown;

type ComponentTypeArray = Array<ComponentType>;

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
	add(this: Handle, ...components: ComponentTypeArray): void;
	set<T extends ComponentType>(this: Handle, ctype: T, value: T): Handle;
	patch<T extends ComponentType>(this: Handle, ctype: T, patcher: (current: T) => T): void;
	has<T extends ComponentTypeArray>(this: Handle, ...components: T): void;
	get<T extends ComponentTypeArray>(this: Handle, ...components: T): LuaTuple<T>;
	try_get<T extends ComponentType>(this: Handle, component: T): T | undefined;
	remove<T extends ComponentTypeArray>(this: Handle, ...components: T): void;
}

type IterableObject<T extends object, U extends unknown[]> = T & IterableFunction<LuaTuple<U>>;

export type View<T extends ComponentTypeArray> = IterableObject<{
	// TS EXCLUSIVE
	size(this: View<T>): number;

	exclude<U extends ComponentTypeArray>(this: View<T>, ...components: U): View<T>;
	use<U extends ComponentType>(this: View<T>, lead: U): View<T>;
}, [Entity, ...T]>;

export type Observer<T extends ComponentTypeArray> = IterableObject<{
	// TS EXCLUSIVE
	size(this: Observer<T>): number;

	exclude<U extends ComponentTypeArray>(this: Observer<T>, ...components: U): Observer<T>;
	disconnect(this: Observer<T>): Observer<T>;
	reconnect(this: Observer<T>): Observer<T>;

	persist(this: Observer<T>): Observer<T>;
	clear(this: Observer<T>): Observer<T>;
}, [Entity, ...T]>;

export type Group<T extends ComponentTypeArray> = IterableObject<{
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
	add<T extends ComponentTypeArray>(this: Registry, id: Entity, ...components: T): void;
	set<T extends ComponentType>(this: Registry, id: Entity, ctype: T, value: T): void;
	patch<T extends ComponentType>(this: Registry, id: Entity, ctype: T, patcher: (component: T) => T): void;
	has<T extends ComponentTypeArray>(this: Registry, id: Entity, ...components: T): boolean;
	get<T extends ComponentTypeArray>(this: Registry, id: Entity, ...components: T): LuaTuple<T>,
	try_get<T extends ComponentType>(this: Registry, id: Entity, component: T): T | undefined,
	remove<T extends ComponentTypeArray>(this: Registry, id: Entity, ...components: T): void,

	view<T extends ComponentTypeArray>(this: Registry, ...components: T): View<T>;
	track<T extends ComponentTypeArray>(this: Registry, ...components: T): Observer<T>;
	group<T extends ComponentTypeArray>(this: Registry, ...components: T): Group<T>;

	clear<T extends ComponentTypeArray>(this: Registry, ...components: T): void,
	storage<T extends ComponentType>(this: Registry, ctype: T): Pool<T>

	added<T extends ComponentType>(this: Registry, ctype: T): Signal<[Entity, T]>,
	changed<T extends ComponentType>(this: Registry, ctype: T): Signal<[Entity, T]>,
	removing<T extends ComponentType>(this: Registry, ctype: T): Signal<[Entity]>,

	handle(this: Registry, id: Entity): Handle;
	handle(this: Registry): Handle;
	context(this: Registry): Handle;
}

export namespace ecr {
	export const entity: unknown;
	export const null_id: number;

	export function registry(): Registry;
	export function component<T extends ComponentType>(constructor: () => T): T;
	export function component<T extends ComponentType>(): T;
	export function tag(): undefined
	export function is_tag(ctype: ComponentType): boolean;
	export function name<T extends ComponentType>(names: T & []): ReadonlyArray<T>;
	export function queue<T extends unknown[]>(signal: QueueableSignal<T>): Queue<T>;
	export function queue<T extends unknown[]>(): Queue<T>;
	export function extract(entity: Entity): LuaTuple<[number, number]>;
}

export default ecr;