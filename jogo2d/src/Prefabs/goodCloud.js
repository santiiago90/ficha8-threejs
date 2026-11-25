import { criarSprite } from '../Materials/sprite.js';
import { Clouds } from '../Scripts/Clouds.js';
import { CloudSpawnBoxes } from '../Scripts/CloudSpawnBoxes.js';
import { createBox } from './box.js';

export async function createGoodCloud(fisica, x, y) {
  const cloud = await criarSprite('assets/Sprites/Objects/Cloud_1.png');
  cloud.name = 'GoodCloud';
  cloud.position.set(x, y, 0.5);
  cloud.scale.set(0.5, 0.5, 1);

  const movement = new Clouds(cloud);
  movement.speed *= 3;
  const spawnBoxes = new CloudSpawnBoxes(cloud, fisica);
  spawnBoxes.boxPrefab = createBox;
  return cloud;
}
