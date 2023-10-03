export default class Accelerator {
  constructor(acceleration: [number, number]) {
    this.acceleration = acceleration;
  }
  speed = [0, 0];
  velocity = [0, 0];
  acceleration = [0, 0];
  tick(dt: number) {
    this.velocity[0] += this.acceleration[0] * dt;
    this.velocity[1] += this.acceleration[1] * dt;
    this.speed[0] += this.velocity[0] * dt;
    this.speed[1] += this.velocity[1] * dt;
  }
  get isFalling() {
    return this.speed[1] > 0;
  }
  get speedX() {
    return this.speed[0];
  }
  get speedY() {
    return this.speed[1];
  }
  get velocityX() {
    return this.velocity[0];
  }
  get velocityY() {
    return this.velocity[1];
  }
  setSpeedX(x: number) {
    this.speed[0] = x;
  }
  setSpeedY(y: number) {
    this.speed[1] = y;
  }
  setVelocityX(x: number) {
    this.velocity[0] = x;
  }
  setVelocityY(y: number) {
    this.velocity[1] = y;
  }
  inverseVelocityX() {
    this.velocity[0] *= -1;
  }
}
