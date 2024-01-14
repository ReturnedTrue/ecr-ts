<div align="center">
	<img src="https://github.com/ReturnedTrue/ecr-ts/blob/master/images/logo.svg" width="600" alt="ecr-ts logo">
</div>

___

Fork of [ecr](https://github.com/centau/ecr) for Roblox-ts.

# Differences to Luau version
- TS has no length operator, instead use `.size()`. Queues and Pools have it as a property, `.size`
- Components don't need to be casted, instead supply the generic
- This package is versioned with `<ecr version>-ts.<x>` where x is incremented for any changes to the TS version in particular 

# Code Sample

```ts
import ecr, { Registry } from "@rbxts/ecr";

// define components
const Position = ecr.component<Vector3>();
const Velocity = ecr.component<Vector3>();

// define a system
function update_physics(world: Registry, dt: number) {
	for (const [id, pos, vel] of world.view(Position, Velocity)) {
		world.set(id, Position, pos.add(vel.mul(dt)));
	}
}

// instantiate the world
const world = ecr.registry();

// create entities and assign components
for (const i of $range(1, 10)) {
	const id = world.create();
	world.set(id, Position, new Vector3(i, 1, 1));
	world.set(id, Velocity, new Vector3(10, 0, 0));
}

// run system
update_physics(world, 1/60);
```