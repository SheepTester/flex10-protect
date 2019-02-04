const upperDiacritics = [
  '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306',
  '\u0310', '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a',
  '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303',
  '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f',
  '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364',
  '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b',
  '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346',
  '\u031a'
];
function genDiacriticBeam(width = 4, length = 100) {
  let str = '';
  for (let i = width; i--;) {
    str += ' ';
    for (let j = length; j--;) {
      str += upperDiacritics[Math.floor(Math.random() * upperDiacritics.length)];
    }
  }
  return str;
}

function compareDistance(dx, dy, dist) {
  const squares = dx * dx + dy * dy;
  const square = dist * dist;
  return squares > square ? 1 : squares < square ? -1 : 0;
}

const GAME_WIDTH = 300; // 1:1.5
const GAME_HEIGHT = 450;
const GAME_WIDTH_RADIUS = GAME_WIDTH / 2;
const NAVBAR_HEIGHT = 60;
const controls = { movement: {strength: 0, direction: 0}, shooting: {direction: 0, active: false} };
let gameWindow = {y: NAVBAR_HEIGHT};
function doScreenSizeCalculations() {
  const width = window.innerWidth;
  const height = window.innerHeight - NAVBAR_HEIGHT;
  if (height / width > 1.5) {
    document.body.style.setProperty('--scale', gameWindow.scale = width / GAME_WIDTH);
    document.body.style.setProperty('--right', 0);
    0;
  } else {
    document.body.style.setProperty('--scale', gameWindow.scale = height / GAME_HEIGHT);
    document.body.style.setProperty('--right', (width - GAME_WIDTH * height / GAME_HEIGHT) / 2 + 'px');
  }
  gameWindow.x = width / 2;
}
window.addEventListener('resize', doScreenSizeCalculations);

function getMouseXY(pair) {
  return {
    mouseX: (pair.clientX - gameWindow.x) / gameWindow.scale,
    mouseY: (pair.clientY - gameWindow.y) / gameWindow.scale
  };
}
document.addEventListener('mousemove', e => {
  const {mouseX, mouseY} = getMouseXY(e);
  controls.shooting.direction = Math.atan2(mouseY - player.y, mouseX - player.x);
});
document.addEventListener('mousedown', e => {
  controls.shooting.active = true;
});
document.addEventListener('mouseup', e => {
  controls.shooting.active = false;
});

const keys = {left: false, up: false, right: false, down: false};
function keyControls() {
  controls.movement.strength = 1;
  if (keys.up && !keys.down) {
    if (keys.left && !keys.right) controls.movement.direction = 5 * Math.PI / 4;
    else if (keys.right && !keys.left) controls.movement.direction = 7 * Math.PI / 4;
    else controls.movement.direction = 3 * Math.PI / 2;
  } else if (keys.down && !keys.up) {
    if (keys.left && !keys.right) controls.movement.direction = 3 * Math.PI / 4;
    else if (keys.right && !keys.left) controls.movement.direction = Math.PI / 4;
    else controls.movement.direction = Math.PI / 2;
  } else {
    if (keys.left && !keys.right) controls.movement.direction = Math.PI;
    else if (keys.right && !keys.left) controls.movement.direction = 0;
    else controls.movement.strength = 0;
  }
}
document.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 37: case 65: keys.left = true; break;
    case 38: case 87: keys.up = true; break;
    case 39: case 68: keys.right = true; break;
    case 40: case 83: keys.down = true; break;
    case 32: controls.shooting.active = true; break;
  }
  keyControls();
});
document.addEventListener('keyup', e => {
  switch (e.keyCode) {
    case 37: case 65: keys.left = false; break;
    case 38: case 87: keys.up = false; break;
    case 39: case 68: keys.right = false; break;
    case 40: case 83: keys.down = false; break;
    case 32: controls.shooting.active = false; break;
  }
  keyControls();
});

const objects = [];

class Positionable {

  constructor(initX = 0, initY = 0) {
    this.x = initX;
    this.y = initY;
    objects.push(this);
    this.removed = false;

    this.elem = document.createElement('div');
    this.elem.classList.add('floating');
    this.isPositionable = true;
  }

  tick(timePassed) {
    //
  }

  position() {
    this.elem.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  remove() {
    if (this.removed) return;
    if (this.elem.parentNode) this.elem.parentNode.removeChild(this.elem);
    const index = objects.indexOf(this);
    if (~index) objects.splice(index, 1);
    this.removed = true;
  }

}

const POST_WIDTH_RADIUS = 100;
const POST_HEIGHT_RADIUS = 50;
class Post extends Positionable {

  constructor(author, content) {
    super(0, GAME_HEIGHT);
    this.elem.classList.add('post');
    this.elem.classList.add('post-by-' + author);
    this.elem.textContent = content;

    this.prog = 0;
    this.bulletCollideable = true;
    this.isPost = true;
  }

  tick(timePassed) {
    this.prog += timePassed / 500;
    this.y = GAME_HEIGHT - this.prog * GAME_HEIGHT / 100;
  }

  onhit() {
    console.log('post hit!');
  }

}

const bulletTypes = {
  player: {speed: 200, type: ''},
  paffy: {speed: 10, type: 'diacritic'},
  poof: {speed: 10, type: 'diacritic'}
};
const BULLET_RADIUS = 2.5;
class Bullet extends Positionable {

  constructor(initX, initY, parent, direction, speed, type = '') {
    super(initX, initY);
    this.elem.classList.add('bullet');
    if (type) this.elem.classList.add('bullet-' + type);
    this.dx = Math.cos(direction);
    this.dy = Math.sin(direction);
    this.speed = speed;
    this.parent = parent;
    this.isBullet = true;
  }

  tick(elapsedTime) {
    this.x += this.dx * this.speed * elapsedTime / 1000;
    this.y += this.dy * this.speed * elapsedTime / 1000;
    if (this.x > GAME_WIDTH_RADIUS || this.x < -GAME_WIDTH_RADIUS || this.y < 0 || this.y > GAME_HEIGHT) {
      this.remove();
    } else {
      objects.find(obj => {
        if (obj.bulletCollideable && obj !== this.parent) {
          if (obj.isIndividual) {
            if (compareDistance(this.x - obj.x, this.y - obj.y, INDIVIDUAL_RADIUS + BULLET_RADIUS) <= 0) {
              this.remove();
              obj.onhit();
              return true;
            }
          } else if (obj.isPost) {
            if (this.x - BULLET_RADIUS < obj.x + POST_WIDTH_RADIUS && this.x + BULLET_RADIUS > obj.x - POST_WIDTH_RADIUS
                && this.y - BULLET_RADIUS < obj.y + POST_HEIGHT_RADIUS && this.y + BULLET_RADIUS > obj.y - POST_HEIGHT_RADIUS) {
              this.remove();
              obj.onhit();
              return true;
            }
          }
        }
      });
    }
  }

}

const INDIVIDUAL_RADIUS = 15;
class Individual extends Positionable {

  constructor(initX, initY, person) {
    super(initX, initY);
    this.elem.classList.add('person');
    this.elem.classList.add('person-' + person);
    this.direction = 0;
    this.speed = 0;
    this.xv = this.yv = 0;

    this.person = person
    this.bulletCollideable = true;
    this.isIndividual = true;
  }

  tick(elapsedTime) {
    this.xv += (Math.cos(this.direction) * this.speed - this.xv) * 0.6 * elapsedTime / 30;
    this.yv += (Math.sin(this.direction) * this.speed - this.yv) * 0.6 * elapsedTime / 30;
    this.x += this.xv;
    this.y += this.yv;
  }

  shoot(direction = this.direction) {
    this.elem.parentNode.appendChild(new Bullet(this.x, this.y, this, direction, bulletTypes[this.person].speed, bulletTypes[this.person].type).elem);
  }

  onhit() {
    console.log('individual hit!');
  }

}

const SHOOTING_SPEED = 200;
class Player extends Individual {

  constructor() {
    super(0, INDIVIDUAL_RADIUS * 2, 'player');
    this.shootingTimer = 0;
  }

  tick(elapsedTime) {
    this.direction = controls.movement.direction;
    this.speed = controls.movement.strength * 5;
    if (controls.shooting.active) {
      this.shootingTimer -= elapsedTime;
      if (this.shootingTimer < 0) {
        this.shootingTimer = SHOOTING_SPEED;
        this.shoot(controls.shooting.direction);
      }
    } else {
      this.shootingTimer = 0;
    }
    super.tick(elapsedTime);
  }

}

const player = new Player();

let lastTime = Date.now();
function tick() {
  window.requestAnimationFrame(tick);
  const now = Date.now();
  const elapsedTime = now - lastTime;
  [...objects].forEach(obj => {
    obj.tick(elapsedTime);
    obj.position(elapsedTime);
  });
  lastTime = now;
}

let gameWrapper;
document.addEventListener('DOMContentLoaded', e => {
  doScreenSizeCalculations();
  gameWrapper = document.getElementById('game');
  const post = new Post('munkler', 'All students are now required to recite the SELF anthem every morning during the announcements.');
  gameWrapper.appendChild(post.elem);
  setTimeout(() => {
    const post = new Post('gggta', 'ربما سأكون الراسم أنا بالفعل T racer ماذا عن ويدماكر؟ أنا بالفعل Widow market سأكون باستيون نيرف باستيون أنت على حق. لذا ، ونستون أريد أن أكون وينستون أعتقد أنني سأكون جينجي أنا بالفعل جينجي ثم سأكون مكري لقد اخترت بالفعل مكري 🇸🇦🇸🇦🇸🇦🇸🇦🇸🇦');
    gameWrapper.appendChild(post.elem);
  }, 12000);
  gameWrapper.appendChild(new Individual(-40, 160, 'paffy').elem);
  gameWrapper.appendChild(new Individual(40, 160, 'poof').elem);
  gameWrapper.appendChild(player.elem);
  tick();
}, {once: true});
