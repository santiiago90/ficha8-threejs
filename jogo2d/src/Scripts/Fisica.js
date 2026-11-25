import RAPIER from '@dimforge/rapier2d-compat';
import * as THREE from 'three';

const objectsByCollider = new Map();

function registerCollider(physics, object, collider) {
  object.userData.collider = collider;
  object.userData.physics = physics;
  objectsByCollider.set(collider.handle, object);
}

export function adicionarRigidbody(fisica, objeto, massa = 1) {
  const descricao = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(objeto.position.x, objeto.position.y)
    .setAdditionalMass(massa);
  const corpo = fisica.createRigidBody(descricao);
  objeto.userData.rigidBody = corpo;
  objeto.userData.physics = fisica;
  return corpo;
}

export function adicionarRigidbodyCinematico(fisica, objeto) {
  const descricao = RAPIER.RigidBodyDesc.kinematicPositionBased()
    .setTranslation(objeto.position.x, objeto.position.y);
  const corpo = fisica.createRigidBody(descricao);
  objeto.userData.rigidBody = corpo;
  objeto.userData.physics = fisica;
  return corpo;
}

export function raycast(fisica, origin, direction, distance) {
  const ray = new RAPIER.Ray({ x: origin.x, y: origin.y }, direction);
  const hit = fisica.castRay(ray, distance, true);
  return hit ? objectsByCollider.get(hit.collider.handle) ?? null : null;
}

export function sincronizarFisica(scene) {
  scene.traverse((objeto) => {
    const corpo = objeto.userData.rigidBody;
    if (corpo) {
      const posicao = corpo.translation();
      objeto.position.x = posicao.x;
      objeto.position.y = posicao.y;
      objeto.rotation.z = corpo.rotation();
    }
  });
}

export function adicionarBoxCollider(fisica, objeto, ajusteX = 1, ajusteY = 1, deslocX = 0, deslocY = 0) {
  const caixa = new THREE.Box3().setFromObject(objeto);
  const tamanho = caixa.getSize(new THREE.Vector3());
  const centro = caixa.getCenter(new THREE.Vector3());
  const dx = tamanho.x * deslocX;
  const dy = tamanho.y * deslocY;
  const descricao = RAPIER.ColliderDesc.cuboid(
    tamanho.x / 2 * ajusteX,
    tamanho.y / 2 * ajusteY,
  ).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  const corpo = objeto.userData.rigidBody;
  let collider;
  if (corpo) {
    descricao.setTranslation(dx, dy);
    collider = fisica.createCollider(descricao, corpo);
  } else {
    descricao.setTranslation(centro.x + dx, centro.y + dy);
    collider = fisica.createCollider(descricao);
  }
  registerCollider(fisica, objeto, collider);
  return collider;
}

// Sensor circular fixo, calculado depois de adicionar a imagem ao objeto.
export function adicionarCircleCollider(fisica, objeto, isTrigger = false) {
  const caixa = new THREE.Box3().setFromObject(objeto);
  const tamanho = caixa.getSize(new THREE.Vector3());
  const centro = caixa.getCenter(new THREE.Vector3());
  const descricao = RAPIER.ColliderDesc.ball(tamanho.x / 2)
    .setTranslation(centro.x, centro.y)
    .setSensor(isTrigger)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  const collider = fisica.createCollider(descricao);
  registerCollider(fisica, objeto, collider);
  return collider;
}

export function handleCollisions(fisica, eventos) {
  eventos.drainCollisionEvents((handle1, handle2, started) => {
    if (!started) return;
    const collider1 = fisica.getCollider(handle1);
    const collider2 = fisica.getCollider(handle2);
    const object1 = objectsByCollider.get(handle1);
    const object2 = objectsByCollider.get(handle2);
    
    if (!collider1 || !collider2 || !object1 || !object2) return;
    const callback = collider1.isSensor() || collider2.isSensor()
      ? 'onTriggerEnter' : 'onCollisionEnter';
    object1.userData.script?.[callback]?.(object2);
    object2.userData.script?.[callback]?.(object1);
  });
}

export function destroyObject(object) {
  const { collider, rigidBody, physics } = object.userData;
  if (collider) {
    objectsByCollider.delete(collider.handle);
    physics.removeCollider(collider, false);
    object.userData.collider = null;
  }
  if (rigidBody) {
    physics.removeRigidBody(rigidBody);
    object.userData.rigidBody = null;
  }
  object.removeFromParent();
}
