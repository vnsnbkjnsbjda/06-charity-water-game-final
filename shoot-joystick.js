// Global output for aim joystick
const joystickAim = {
  angle: 0,
  firing: false,
};

// Create joystick elements
const aimContainer = document.createElement('div');
const aimStick = document.createElement('div');

aimContainer.style.position = 'fixed';
aimContainer.style.bottom = '20px';
aimContainer.style.right = '20px';
aimContainer.style.width = '120px';
aimContainer.style.height = '120px';
aimContainer.style.borderRadius = '50%';
aimContainer.style.background = 'rgba(255,255,255,0.1)';
aimContainer.style.touchAction = 'none';
aimContainer.style.zIndex = '1000';

aimStick.style.position = 'absolute';
aimStick.style.left = '30px';
aimStick.style.top = '30px';
aimStick.style.width = '60px';
aimStick.style.height = '60px';
aimStick.style.borderRadius = '50%';
aimStick.style.background = 'red';
aimStick.style.opacity = '0.6';
aimStick.style.touchAction = 'none';

aimContainer.appendChild(aimStick);
document.body.appendChild(aimContainer);

// Internal state
let aiming = false;
let aimOrigin = { x: 0, y: 0 };

function startAim(x, y) {
  aimOrigin = { x, y };
  aiming = true;
  joystickAim.firing = true;
}

function moveAim(x, y) {
  if (!aiming) return;
  const maxDist = 40;
  let dx = x - aimOrigin.x;
  let dy = y - aimOrigin.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > maxDist) {
    dx = (dx * maxDist) / dist;
    dy = (dy * maxDist) / dist;
  }

  aimStick.style.transform = `translate(${dx}px, ${dy}px)`;

  joystickAim.firing = true;
  joystickAim.angle = Math.atan2(dy, dx);
}

function endAim() {
  aiming = false;
  joystickAim.firing = false;
  aimStick.style.transform = `translate(0px, 0px)`;
}

// Touch events
aimContainer.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  startAim(t.clientX, t.clientY);
}, { passive: true });
aimContainer.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  moveAim(t.clientX, t.clientY);
}, { passive: true });
aimContainer.addEventListener('touchend', endAim);

// Mouse events
aimContainer.addEventListener('mousedown', (e) => {
  startAim(e.clientX, e.clientY);
});
window.addEventListener('mousemove', (e) => {
  moveAim(e.clientX, e.clientY);
});
window.addEventListener('mouseup', endAim);