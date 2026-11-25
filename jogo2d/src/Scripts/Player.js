
import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';
import { destroyObject } from './Fisica.js';

export class Player {
  #playerRb;
  #horizontal = 0;
  #myAnimation;
  #dying = false;
  #diedOnEnemy = false;
  #bottomBeforeStep;
  #verticalSpeedBeforeStep;

  // Variáveis do salto
  #grounded;
  #canDoubleJump;
  #jumpPressed = false;
  
  //Dados iniciais
  movementSpeed = 4;
  jumpPower = 50;
  lives = 3;
  lifeImages = [];
  #lastPlatform;
  #checkpoint;
  #posicaoInicial;


  constructor(object) {
    this.object = object;
    this.object.userData.script = this;
  }

  start() {
    this.#playerRb = this.object.userData.rigidBody;
    this.#myAnimation = this.object.userData.animator;
    this.#playerRb.lockRotations(true, true);
    this.#posicaoInicial = { ...this.#playerRb.translation() };
    this.#grounded = true;
    this.#canDoubleJump = false;
  }

  update(dt) {
    const jump = Input.getButton('Jump');

    if (this.#dying) {
      this.#jumpPressed = jump;
      if (dt > 0 && this.#myAnimation.finished) this.#finishDeath();
      return;
    }

    // Movimento horizontal
    this.#horizontal = Input.getAxis('Horizontal') * (Input.getButton('Walk') ? 0.5 : 1);

    if (dt > 0 && jump && !this.#jumpPressed) {
      if (this.#grounded) {
        // Primeiro salto
        this.#playerRb.applyImpulse(
          { x: 0, y: this.jumpPower },
          true
        );

        this.#canDoubleJump = true;
        this.#grounded = false;

      } else if (this.#canDoubleJump) {
        // Segundo salto
        this.#canDoubleJump = false;

        this.#playerRb.setLinvel(
          { x: this.#playerRb.linvel().x, y: 0 },
          true
        );

        this.#playerRb.applyImpulse(
          { x: 0, y: this.jumpPower / 1.75 },
          true
        );
      }
    }

    this.#jumpPressed = jump;

    const verticalSpeed = Math.abs(this.#playerRb.linvel().y);
    this.#myAnimation.setFloat('verticalSpeed', verticalSpeed);
    this.#myAnimation.parameters.grounded = this.#grounded && verticalSpeed <= 0.1;
  }

  fixedUpdate() {
    if (this.#dying) return;
    this.#handleMovement();
    // Guardar a aproximação antes de o Rapier resolver a colisão.
    const collider = this.object.userData.collider;
    this.#bottomBeforeStep = collider.translation().y - collider.halfExtents().y;
    this.#verticalSpeedBeforeStep = this.#playerRb.linvel().y;
  }

  onCollisionEnter(other) {
    if (this.#dying) return;
    const tag = other.userData.tag;
    if (tag === 'enemy' && this.#tryStomp(other)) return;
    if (tag === 'limit' || tag === 'enemy') {
      this.#diedOnEnemy = tag === 'enemy';
      this.lives--;
      const lifeImage = this.lifeImages[this.lives];
      lifeImage.src = 'assets/Sprites/Objects/heart-empty.svg';
      lifeImage.alt = 'Vida perdida';

      this.#dying = true;
      this.#playerRb.setLinvel({ x: 0, y: 0 }, true);
      this.#playerRb.setGravityScale(0, true);
      this.#myAnimation.setFloat('isDead', 1);
      return;
    }
    if (tag === 'platform') {
      this.#grounded = true;
      this.#canDoubleJump = false;
      this.#lastPlatform = other;
    }
  }

  onTriggerEnter(other) {
    if (other.userData.tag === 'box') {
      destroyObject(other);
    } else if (!this.#dying && other.userData.tag === 'checkpoint') {
      const { x, y } = other.position;
      this.#checkpoint = { x, y: y + 1 };
    }
  }

  #tryStomp(enemy) {
    if (!(this.#verticalSpeedBeforeStep < 0)) return false;
    const collider = enemy.userData.collider;
    if (!collider) return false;
    const enemyTop = collider.translation().y + collider.halfExtents().y;
    // Pequena margem para a resolução do contacto e a patrulha vertical.
    if (this.#bottomBeforeStep < enemyTop - 0.06) return false;

    destroyObject(enemy);
    this.#playerRb.setLinvel({ x: this.#playerRb.linvel().x, y: 5 }, true);
    this.#grounded = false;
    return true;
  }

  #finishDeath() {
    if (this.lives === 0) {
      SceneManager.loadScene('gameover');
      return;
    }

    const plataforma = this.#lastPlatform?.position;
    const destinoPlataforma = plataforma ? { x: plataforma.x, y: plataforma.y + 2 } : null;
    const destino = (this.#diedOnEnemy ? destinoPlataforma : this.#checkpoint)
      ?? this.#checkpoint ?? destinoPlataforma ?? this.#posicaoInicial;
    this.#playerRb.setTranslation(destino, true);
    this.#playerRb.setLinvel({ x: 0, y: 0 }, true);
    this.#playerRb.setGravityScale(1, true);
    this.#grounded = false;
    this.#canDoubleJump = false;
    this.#horizontal = 0;
    this.#dying = false;
    this.#myAnimation.setFloat('speed', 0);
    this.#myAnimation.setFloat('verticalSpeed', 0);
    this.#myAnimation.parameters.grounded = false;
    this.#myAnimation.setFloat('isDead', 0);
  }

  #handleMovement() {
    if (this.#horizontal !== 0) {
      this.object.scale.x = Math.abs(this.object.scale.x) * Math.sign(this.#horizontal);
    }
    this.#playerRb.setLinvel(
      {
        x: this.#horizontal * this.movementSpeed,
        y: this.#playerRb.linvel().y
      },
      true
    );
    this.#myAnimation.setFloat('speed', Math.abs(this.#horizontal));
  }
}
