export class Level1Manager {
  cloudPrefab1 = null;
  cloudPrefab2 = null;
  goodCloudPrefab = null;

  constructor(object, scene, scripts) {
    this.object = object;
    this.scene = scene;
    this.scripts = scripts;
  }

  async start() {
    const position = this.object.position;
    await this.#instantiate(this.cloudPrefab1, position);
    const cloud = await this.#instantiate(this.cloudPrefab2, position);
    cloud.userData.script.isMovingLeft = true;
    const goodCloud = await this.#instantiate(this.goodCloudPrefab, position);
    this.scripts.push(goodCloud.userData.spawnBoxes);
  }

  async #instantiate(prefab, position) {
    const cloud = await prefab(position.x, position.y);
    this.scene.add(cloud);
    this.scripts.push(cloud.userData.script);
    return cloud;
  }
}
