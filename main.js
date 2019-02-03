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

const NAVBAR_WIDTH = 60;
const objects = [];
let screenWidthRadius, screenHeight;
function updateScreenMeasurements() {
  screenWidthRadius = window.innerWidth / 2, screenHeight = window.innerHeight - NAVBAR_WIDTH;
}
window.addEventListener('resize', updateScreenMeasurements);
updateScreenMeasurements();

class Positionable {

  constructor(initX = 0, initY = 0) {
    this.x = initX;
    this.y = initY;
    objects.push(this);

    this.elem = document.createElement('div');
    this.elem.classList.add('floating');
  }

  tick(timePassed) {
    //
  }

  position() {
    this.elem.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

}

class Post extends Positionable {

  constructor(author, content) {
    super(0, screenHeight);
    this.elem.classList.add('post');
    this.elem.classList.add('post-by-' + author);
    this.elem.textContent = content;

    this.prog = 0;
  }

  tick(timePassed) {
    this.prog += timePassed / 500;
    this.y = screenHeight - this.prog * screenHeight / 100;
  }

}

let lastTime = Date.now();
function tick() {
  window.requestAnimationFrame(tick);
  const now = Date.now();
  const elapsedTime = now - lastTime;
  objects.forEach(obj => {
    obj.tick(elapsedTime);
    obj.position(elapsedTime);
  });
  lastTime = now;
}

document.addEventListener('DOMContentLoaded', e => {
  const post = new Post('munkler', 'All students are now required to recite the SELF anthem every morning during the announcements.');
  document.body.appendChild(post.elem);
  tick();
}, {once: true});
