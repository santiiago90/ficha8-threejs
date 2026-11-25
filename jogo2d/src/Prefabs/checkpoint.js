import { CircleGeometry, Mesh, MeshBasicMaterial } from 'three';

export function createCheckpoint(name, x, y) {
  const checkpoint = new Mesh(
    new CircleGeometry(0.1),
    new MeshBasicMaterial({ color: 0xff0000 }),
  );
  checkpoint.name = name;
  checkpoint.position.set(x, y, 1);
  checkpoint.visible = false;
  return checkpoint;
}
