import assert from 'node:assert/strict';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier2d-compat';
import { adicionarBoxCollider, adicionarRigidbody, adicionarRigidbodyCinematico,
  destroyObject, handleCollisions, raycast } from './src/Scripts/Fisica.js';
import { Enemy } from './src/Scripts/Enemy.js';
import { CloudSpawnBoxes } from './src/Scripts/CloudSpawnBoxes.js';
import { DebugFisica } from './src/Scripts/DebugFisica.js';

const listeners = {};
globalThis.window = { addEventListener: (name, listener) => { listeners[name] = listener; } };
const { Player } = await import('./src/Scripts/Player.js');
delete globalThis.window;
await RAPIER.init();

function setup() {
  const world = new RAPIER.World({ x: 0, y: -9.81 });
  world.timestep = 0.02;
  const scene = new THREE.Scene();
  const queue = new RAPIER.EventQueue(true);
  const step = () => { world.step(queue); handleCollisions(world, queue); };
  return { world, scene, step, finish() { queue.free(); world.free(); } };
}

function mesh(scene, tag, x, y, width = 1, height = 1) {
  const object = new THREE.Mesh(new THREE.PlaneGeometry(width, height));
  object.position.set(x, y, 0);
  object.userData.tag = tag;
  scene.add(object);
  return object;
}

function playerIn(scene, world, x, y) {
  const object = mesh(scene, 'player', x, y);
  const body = adicionarRigidbody(world, object);
  adicionarBoxCollider(world, object);
  const player = new Player(object);
  player.lifeImages = [{}, {}, {}];
  object.userData.animator = { parameters: {}, setFloat() {}, finished: true };
  player.start();
  return { object, player, body };
}

for (const axis of ['x', 'y']) {
  const { world, scene, step, finish } = setup();
  const group = new THREE.Group();
  group.position.set(5, 2, 0);
  scene.add(group);
  const left = new THREE.Object3D();
  const right = new THREE.Object3D();
  left.position[axis] = -0.4;
  right.position[axis] = 0.4;
  group.add(left, right);
  const object = mesh(scene, 'enemy', 5, 2);
  const body = adicionarRigidbodyCinematico(world, object);
  adicionarBoxCollider(world, object);
  const enemy = new Enemy(object);
  enemy.axis = axis;
  enemy.checkpoint1 = right;
  enemy.checkpoint2 = left;
  enemy.start();
  assert.equal(enemy.checkpoint1, left);
  let turned = false;
  for (let i = 0; i < 100; i++) {
    enemy.fixedUpdate(0.02);
    step();
    const center = group.position[axis];
    assert.ok(Math.abs(object.position[axis] - center) <= 0.401);
    assert.ok(Math.abs(object.position[axis] - body.translation()[axis]) < 0.001);
    turned ||= !enemy.isMovingLeft;
  }
  assert.ok(turned);
  destroyObject(object);
  enemy.fixedUpdate(0.02);
  assert.equal(world.bodies.len(), 0);
  finish();
}

{
  const { world, scene, step, finish } = setup();
  const { player } = playerIn(scene, world, 0, 0);
  const platform = mesh(scene, 'platform', 0, 2, 2, 0.5);
  adicionarBoxCollider(world, platform);
  const cloud = new THREE.Object3D();
  cloud.position.set(0, 4, 0);
  scene.add(cloud);
  const debug = new DebugFisica(scene, world);
  const boxes = new CloudSpawnBoxes(cloud, world);
  let spawned = 0;
  let crate;
  boxes.boxPrefab = async (physics, x, y) => {
    spawned++;
    crate = mesh(scene, 'box', x, y);
    adicionarRigidbody(physics, crate);
    adicionarBoxCollider(physics, crate).setSensor(true);
    return crate;
  };
  step();
  assert.equal(raycast(world, cloud.position, { x: 0, y: -1 }, 10), platform);
  debug.fixedUpdate();
  boxes.fixedUpdate();
  debug.lateUpdate();
  const positions = debug.linhas.geometry.getAttribute('position').array;
  assert.deepEqual([...positions.slice(-6)], [0, 4, 0, 0, -6, 0]);
  assert.equal(spawned, 0);
  destroyObject(platform);
  adicionarBoxCollider(world, mesh(scene, 'platform', 0, -1));
  step();
  boxes.fixedUpdate();
  boxes.fixedUpdate();
  await Promise.resolve();
  assert.equal(spawned, 1);
  assert.equal(crate.parent, scene);
  for (let i = 0; i < 100 && crate.parent; i++) {
    player.fixedUpdate();
    step();
  }
  assert.equal(crate.parent, null);
  assert.equal(crate.userData.collider, null);
  assert.equal(crate.userData.rigidBody, null);
  assert.equal(player.lives, 3);
  finish();
}

{
  const { world, scene, step, finish } = setup();
  const { object, player, body } = playerIn(scene, world, 0, 0);
  const enemy = mesh(scene, 'enemy', 0.95, 0);
  adicionarRigidbodyCinematico(world, enemy);
  adicionarBoxCollider(world, enemy);
  const platform = mesh(scene, 'platform', 3, 1);
  player.onCollisionEnter(platform);
  player.onTriggerEnter(mesh(scene, 'checkpoint', 9, 5));
  player.fixedUpdate();
  step();
  assert.equal(player.lives, 2);
  assert.equal(enemy.parent, scene);
  player.update(0.02);
  assert.equal(body.translation().x, 3);
  assert.equal(body.translation().y, 3);
  listeners.keydown({ code: 'ArrowLeft' });
  player.update(0.02);
  player.fixedUpdate();
  assert.equal(object.scale.x, -1);
  listeners.keyup({ code: 'ArrowLeft' });
  listeners.keydown({ code: 'ArrowRight' });
  player.update(0.02);
  player.fixedUpdate();
  assert.equal(object.scale.x, 1);
  listeners.keyup({ code: 'ArrowRight' });
  finish();
}

{
  const { world, scene, step, finish } = setup();
  const { player, body } = playerIn(scene, world, 0, 1.12);
  const enemy = mesh(scene, 'enemy', 0, 0);
  adicionarRigidbodyCinematico(world, enemy);
  adicionarBoxCollider(world, enemy);
  body.setLinvel({ x: 0, y: -4 }, true);
  for (let i = 0; i < 6 && enemy.parent; i++) {
    player.fixedUpdate();
    step();
  }
  assert.equal(enemy.parent, null);
  assert.equal(world.bodies.len(), 1);
  assert.equal(player.lives, 3);
  assert.ok(body.linvel().y > 0);
  finish();
}

console.log('OK: patrulhas, raycast, debug, caixa, dano, respawn, viragem e salto sobre inimigo.');
