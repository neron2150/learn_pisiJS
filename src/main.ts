import { Application, Assets, Container, Sprite, Text } from "pixi.js";
import "./style.css";
import Accelerator from "./Accelerator";
import { sound } from "@pixi/sound";
const app = new Application({ resizeTo: window });

document.body.appendChild(app.view as unknown as Node);
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}
toggleFullScreen();
let speed = 1;
let bunnyAccelerator: any = null;
let bg_layer1: any = null;
let bunny_stand: any = null;
let bunny_jump: any = null;
let carrotTexture: any = null;
let ground_grass: any = null;

const loadAssets = async () => {
  app.ticker.stop();
  bunnyAccelerator = new Accelerator([0, 0.01]);
  bg_layer1 = await Assets.load("assets/bg_layer1.png");
  bunny_stand = await Assets.load("assets/bunny1_stand.png");
  bunny_jump = await Assets.load("assets/bunny1_jump.png");
  carrotTexture = await Assets.load("assets/carrot.png");
  ground_grass = await Assets.load("assets/ground_grass.png");

  app.ticker.start();
};
const gameStart = () => {
  sound.add("jump", "assets/sfx/phaseJump1.ogg");
  sound.add("collect", "assets/sfx/powerUp6.ogg");

  let carrotsCount = 0;
  let isGameOver = false;
  const gameOverStage = new Container();
  const gameOverText = new Text("Game Over");
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.renderer.width / 2;
  gameOverText.y = app.renderer.height / 2;
  gameOverStage.addChild(new Sprite(bg_layer1));
  gameOverStage.addChild(gameOverText);
  const gameStage = app.stage;
  const bunny = new Sprite(bunny_stand);
  bunny.anchor.set(0.5);

  bunny.scale.set(0.5);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      bunnyAccelerator.setSpeedX(-2);
    }
    if (e.key === "ArrowRight") {
      bunnyAccelerator.setSpeedX(2);
    }
    if (e.key == " " || e.code == "Space") {
      app.stage = gameStage;
      isGameOver = false;
    }
  });

  app.stage.eventMode = "static";
  gameOverStage.eventMode = "static";
  app.stage.on("pointerdown", (e) => {
    if (e.screenX < app.renderer.width / 2) {
      bunnyAccelerator.setSpeedX(-2);
    } else {
      bunnyAccelerator.setSpeedX(2);
    }
  });
  gameOverStage.on("pointerdown", () => {
    if (isGameOver) {
      app.stage = gameStage;
      isGameOver = false;
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") {
      bunnyAccelerator.setVelocityX(0);
    }
    if (e.key === "ArrowRight") {
      bunnyAccelerator.setVelocityX(0);
    }
  });
  const randomPlatformX = () =>
    Math.random() * xDist * 2 - xDist + app.renderer.width / 2;
  const xDist = 200;
  const addCarrot = (platform: Sprite) => {
    if (platform.children.length > 0) {
      return;
    }
    const carrot = new Sprite(carrotTexture);
    carrot.y = -carrot.height;
    carrot.anchor.set(0.5);
    platform.addChild(carrot);
  };
  let platforms: Sprite[] = [];
  const carrotsText = new Text(`carrots: ${carrotsCount}  `);
  const init = () => {
    sound.volumeAll = 0.5;
    sound.volume("collect", 0.3);
    app.stage.addChild(new Sprite(bg_layer1));
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;
    carrotsText.x = 50;
    carrotsText.y = 100;

    app.stage.addChild(carrotsText);

    platforms = Array(Math.ceil(app.renderer.height / 150) * 2)
      .fill(null)
      .map((_, i) => {
        const ground = new Sprite(ground_grass);
        ground.anchor.set(0.5);
        ground.x = randomPlatformX();
        ground.y = i * 150;
        ground.scale.set(0.5);
        app.stage.addChild(ground);
        return ground;
      });
    isGameOver = false;
  };
  init();

  app.stage.addChild(bunny);
  app.ticker.add(() => {
    if (isGameOver) {
      return;
    }
    if (bunny.x < app.renderer.width / 2 - 300) {
      bunny.x = app.renderer.width / 2 - 300;
      bunnyAccelerator.setSpeedX(3);
    }
    if (bunny.x > app.renderer.width / 2 + 300) {
      bunny.x = app.renderer.width / 2 + 300;
      bunnyAccelerator.setSpeedX(-3);
    }
    if (bunny.y > app.renderer.height + 100) {
      isGameOver = true;
      app.stage = gameOverStage;
      bunny.y = app.renderer.height / 2;
      bunny.x = app.renderer.width / 2;
      bunnyAccelerator.setSpeedY(0);
      bunnyAccelerator.setSpeedX(0);
      bunnyAccelerator.setVelocityY(0);
      bunnyAccelerator.setVelocityX(0);
      speed = 1;
      carrotsCount = 0;
      carrotsText.text = `carrots: ${carrotsCount}  `;
      platforms.forEach((platform, i) => {
        platform.y = i * 150;
        platform.x = randomPlatformX();
        platform.removeChildren();
      });
    }
  });
  app.ticker.add(() => {
    if (isGameOver) {
      return;
    }
    const hitCarrot = platforms.find((platform) => {
      const carrot = platform.children[0]?.getBounds();
      if (!carrot) return false;

      return (
        bunny.y + bunny.height / 2 > carrot.y - carrot.height / 2 &&
        bunny.y + bunny.height / 2 < carrot.y + carrot.height / 2 &&
        bunny.x + bunny.width / 2 > carrot.x - carrot.width / 2 &&
        bunny.x - bunny.width / 2 < carrot.x + carrot.width / 2
      );
    });
    if (hitCarrot) {
      carrotsCount++;
      carrotsText.text = `carrots: ${carrotsCount}  `;
      sound.play("collect");
      hitCarrot.removeChildAt(0);
    }
  });

  app.ticker.add((dt) => {
    if (isGameOver) {
      return;
    }
    const ddt = dt * speed;
    let topPlatform = platforms[0];
    let bottomPlatform = platforms[platforms.length - 1];

    const hitPlatform = platforms.find(
      (platform) =>
        bunny.y + bunny.height / 2 > platform.y - platform.height / 2 &&
        bunny.y + bunny.height / 2 < platform.y + platform.height / 2 &&
        bunny.x + bunny.width / 2 > platform.x - platform.width / 2 &&
        bunny.x - bunny.width / 2 < platform.x + platform.width / 2
    );

    if (hitPlatform && bunnyAccelerator.isFalling) {
      bunnyAccelerator.setVelocityY(-0.25);
      bunnyAccelerator.setSpeedY(-1);
      bunny.texture = bunny_jump;
      sound.play("jump");
    }
    platforms.forEach((platform) => {
      if (bunnyAccelerator.velocityY > 0) {
        bunny.texture = bunny_stand;
      }

      if (bunny.y < app.renderer.height / 2) {
        platform.y += app.renderer.height / 2 - bunny.y;
        platform.y += ddt;
      } else {
        platform.y += ddt;
      }
      if (topPlatform.y > platform.y) {
        topPlatform = platform;
      }
      if (bottomPlatform.y < platform.y) {
        bottomPlatform = platform;
      }
    });

    if (bottomPlatform.y > app.renderer.height) {
      bottomPlatform.y = topPlatform.y - 150;
      bottomPlatform.x = randomPlatformX();
      addCarrot(topPlatform);
    }
  });

  app.ticker.add((dt) => {
    if (isGameOver) {
      return;
    }
    const ddt = dt * speed;
    bunnyAccelerator.tick(ddt);
    if (bunny.y < app.renderer.height / 2) {
      bunny.y = app.renderer.height / 2;
    }
    bunny.y += bunnyAccelerator.speedY * ddt;
    bunny.x += bunnyAccelerator.speedX * ddt;
    speed += 0.0001;
  });
};

loadAssets().then(gameStart);
