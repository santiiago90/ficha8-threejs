import * as THREE from 'three';
import { adicionarBoxCollider } from '../Scripts/Fisica.js';

export function createLimit(fisica, x, y, length) {
  const limite = new THREE.Mesh(new THREE.PlaneGeometry(length, 1));
  limite.name = 'Limite';
  limite.userData.tag = 'limit';
  limite.position.set(x, y, 0);
  limite.visible = false;
  adicionarBoxCollider(fisica, limite);
  return limite;
}
