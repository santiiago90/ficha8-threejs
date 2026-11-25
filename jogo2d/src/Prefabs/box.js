import { criarSprite } from '../Materials/sprite.js';
import { adicionarBoxCollider, adicionarRigidbody } from '../Scripts/Fisica.js';

export async function createBox(fisica, x, y) {
  const box = await criarSprite('assets/Sprites/Objects/Crate.png');
  box.name = 'Box';
  box.userData.tag = 'box';
  box.position.set(x, y, 1.5);

  adicionarRigidbody(fisica, box);
  adicionarBoxCollider(fisica, box).setSensor(true);
  return box;
}
