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

const GAME_WIDTH = 300; // 1:1.5
const GAME_HEIGHT = 450;
const NAVBAR_HEIGHT = 60;
function doScreenSizeCalculations() {
  const width = window.innerWidth;
  const height = window.innerHeight - NAVBAR_HEIGHT;
  if (height / width > 1.5) {
    document.body.style.setProperty('--scale', width / GAME_WIDTH);
    document.body.style.setProperty('--right', 0);
    // document.body.style.setProperty('--width', '100%');
  } else {
    document.body.style.setProperty('--scale', height / GAME_HEIGHT);
    document.body.style.setProperty('--right', (width - GAME_WIDTH * height / GAME_HEIGHT) / 2 + 'px');
    // document.body.style.setProperty('--width', GAME_WIDTH * height / GAME_HEIGHT + 'px');
  }
}
window.addEventListener('resize', doScreenSizeCalculations);

const objects = [];

class Positionable {

  constructor(initX = 0, initY = 0) {
    this.x = initX;
    this.y = initY;
    objects.push(this);
    this.removed = false;

    this.elem = document.createElement('div');
    this.elem.classList.add('floating');
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

class Post extends Positionable {

  constructor(author, content) {
    super(0, GAME_HEIGHT);
    this.elem.classList.add('post');
    this.elem.classList.add('post-by-' + author);
    this.elem.textContent = content;

    this.prog = 0;
  }

  tick(timePassed) {
    this.prog += timePassed / 500;
    this.y = GAME_HEIGHT - this.prog * GAME_HEIGHT / 100;
  }

}

class Bullet extends Positionable {

  constructor(initX, initY, direction, speed, type = '') {
    super(initX, initY);
    this.elem.classList.add('bullet');
    this.elem.classList.add('bullet-' + type);
    this.dx = Math.cos(direction);
    this.dy = Math.sin(direction);
    this.speed = speed;
  }

  tick(elapsedTime) {
    this.x += this.dx * this.speed * elapsedTime / 1000;
    this.y += this.dy * this.speed * elapsedTime / 1000;
    if (this.x > screenWidthRadius || this.x < -screenWidthRadius || this.y < 0 || this.y > screenHeight) {
      this.remove();
    }
  }

}

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
  tick();
}, {once: true});
