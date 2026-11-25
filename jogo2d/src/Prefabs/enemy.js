import { criarSprite } from '../Materials/sprite.js';
import { Enemy } from '../Scripts/Enemy.js';
import { adicionarBoxCollider, adicionarRigidbodyCinematico } from '../Scripts/Fisica.js';

export async function createEnemy(fisica, x, y, axis = 'x') {
  const vertical = axis === 'y';
  const image = vertical ? 'Spike.png' : 'Skeleton.png';
  const enemy = await criarSprite(`assets/Sprites/Objects/${image}`);
  enemy.name = vertical ? 'VerticalEnemy' : 'Enemy';
  enemy.userData.tag = 'enemy';
  enemy.position.set(x, y, 1.5);
  if (vertical) enemy.scale.set(0.65, 0.65, 1);

  adicionarRigidbodyCinematico(fisica, enemy);
  adicionarBoxCollider(fisica, enemy);

  const script = new Enemy(enemy);
  script.axis = axis;
  return enemy;
}
