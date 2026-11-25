import { criarSprite } from '../Materials/sprite.js';
import { Clouds } from '../Scripts/Clouds.js';

export async function createCloud1(x, y) {
  const cloud = await criarSprite('assets/Sprites/Objects/Cloud_1.png');
  cloud.name = 'Cloud1';
  cloud.position.set(x, y, 0.5);
  new Clouds(cloud);
  return cloud;
}
