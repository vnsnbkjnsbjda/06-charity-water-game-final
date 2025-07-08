// Global joystick input values: range from -1 to 1
const joystickInput = { x: 0, y: 0 };

// Create joystick elements
const container = document.createElement('div');
const stick = document.createElement('div');

container.style.position = 'fixed';
container.style.bottom = '20px';
container.style.left = '20px';
container.style.width = '120px';
container.style.height = '120px';
container.style.borderRadius = '50%';
container.style.background = 'rgba(255,255,255,0.1)';
container.style.touchAction = 'none';
container.style.zIndex = '1000';

stick.style.position = 'absolute';
stick.style.left = '30px';
stick.style.top = '30px';
stick.style.width = '60px';
stick.style.height = '60px';
stick.style.borderRadius = '50%';
stick.style.background = 'white';
stick.style.opacity = '0.6';
stick.style.touchAction = 'none';

container.appendChild(stick);
document.body.appendChild(container);

// Internal state
let dragging = false;
let origin = { x: 0, y: 0 };

// Helpers for both touch and mouse
function startDrag(x, y) {
  origin = { x, y };
  dragging = true;
}

function moveDrag(x, y) {
  if (!dragging) return;
  const maxDist = 40;
  let dx = x - origin.x;
  let dy = y - origin.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > maxDist) {
    dx = (dx * maxDist) / dist;
    dy = (dy * maxDist) / dist;
  }
  joystickInput.x = dx / maxDist;
  joystickInput.y = dy / maxDist;
  stick.style.transform = `translate(${dx}px, ${dy}px)`;
}

function endDrag() {
  dragging = false;
  joystickInput.x = 0;
  joystickInput.y = 0;
  stick.style.transform = 'translate(0px, 0px)';
}

// Touch events
container.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  startDrag(t.clientX, t.clientY);
}, {passive: true});
container.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  moveDrag(t.clientX, t.clientY);
}, {passive: true});
container.addEventListener('touchend', endDrag);

// Mouse events
container.addEventListener('mousedown', (e) => {
  startDrag(e.clientX, e.clientY);
});
window.addEventListener('mousemove', (e) => {
  moveDrag(e.clientX, e.clientY);
});
window.addEventListener('mouseup', endDrag);
