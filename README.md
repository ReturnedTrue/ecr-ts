<div align="center">
	<img src="https://github.com/ReturnedTrue/ECR-ts/blob/master/images/logo.png" alt="ECR-ts Logo">
</div>

___

Fork of [ECR](https://github.com/centau/ecr) for Roblox-ts.

# Differences to Luau version
- Views, Observers and Groups cannot be iterated over, must call the `.iter()` method
- TS has no length operator, instead use `.size()`
- Components don't need to be casted, instead supply the generic

# Code Sample

```ts
import ecr, { Registry } from "@rbxts/ecr";

// define components
const Position = ecr.component<Vector3>();
const Velocity = ecr.component<Vector3>();

// define a system
function update_physics(world: Registry, dt: number) {
	for (const [id, pos, vel] of world.view(Position, Velocity).iter()) {
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