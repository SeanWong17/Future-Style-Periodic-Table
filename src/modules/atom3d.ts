import { getState } from '../state';
import { getElectronData } from '../config/electron';
import { t } from '../i18n';

let expandedCleanupTimeout: ReturnType<typeof setTimeout> | null = null;
let expandedLastFocusedElement: HTMLElement | null = null;

function clampScale(value: number): number {
  return Math.max(0.5, Math.min(2, value));
}

function updateAtomTransform(container: HTMLElement, rotX: number, rotY: number, scale = 1): void {
  container.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
}

export function cancelAtomAnimations(container: HTMLElement): void {
  container.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel());
}

export function render3DAtom(
  Z: number,
  container: HTMLElement = document.getElementById('atomContainer')!,
  scale = 1
): number[] {
  cancelAtomAnimations(container);
  container.textContent = '';

  const nucleus = document.createElement('div');
  nucleus.className = 'nucleus';
  if (scale !== 1) {
    nucleus.style.width = `${12 * scale}px`;
    nucleus.style.height = `${12 * scale}px`;
  }
  container.appendChild(nucleus);

  const state = getState();
  const element = state.elements[Z - 1];
  const shells = element?.shells?.length > 0 ? element.shells : getElectronData(Z).shells;

  shells.forEach((count, idx) => {
    if (count === 0) return;
    const isValence = idx === shells.length - 1;
    const baseSize = scale === 1 ? 40 : 80;
    const increment = scale === 1 ? 25 : 50;
    const size = baseSize + idx * increment;

    const orbit = document.createElement('div');
    orbit.className = 'orbit-ring';
    orbit.style.width = `${size}px`;
    orbit.style.height = `${size}px`;
    orbit.style.top = `calc(50% - ${size / 2}px)`;
    orbit.style.left = `calc(50% - ${size / 2}px)`;

    const rx = Math.random() * 360;
    const ry = Math.random() * 360;
    orbit.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    const animDuration = 5 + idx * 2;
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      orbit.animate(
        [
          { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(0deg)` },
          { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(360deg)` },
        ],
        { duration: animDuration * 1000, iterations: Infinity, easing: 'linear' }
      );
    }

    for (let i = 0; i < count; i++) {
      const electron = document.createElement('div');
      electron.className = `electron ${isValence ? 'valence' : 'inner'}`;
      if (scale !== 1) electron.classList.add('expanded');
      const angle = (360 / count) * i;
      electron.style.transform = `rotate(${angle}deg) translateX(${size / 2}px)`;
      orbit.appendChild(electron);
    }
    container.appendChild(orbit);
  });

  return shells;
}

export function initDragControl(): void {
  const state = getState();
  const wrapper = document.getElementById('atomWrapper')!;
  const atomContainer = document.getElementById('atomContainer')!;

  let activePointerId: number | null = null;

  wrapper.addEventListener('pointerdown', (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.expand-btn')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    activePointerId = e.pointerId;
    wrapper.setPointerCapture(e.pointerId);
    state.isDragging = true;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  });

  wrapper.addEventListener('pointermove', (e: PointerEvent) => {
    if (!state.isDragging || e.pointerId !== activePointerId) return;
    const dx = e.clientX - state.lastMouseX;
    const dy = e.clientY - state.lastMouseY;
    state.rotY += dx * 0.5;
    state.rotX -= dy * 0.5;
    updateAtomTransform(atomContainer, state.rotX, state.rotY);
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  });

  const finishDrag = (e: PointerEvent): void => {
    if (e.pointerId !== activePointerId) return;
    state.isDragging = false;
    activePointerId = null;
    if (wrapper.hasPointerCapture(e.pointerId)) wrapper.releasePointerCapture(e.pointerId);
  };
  wrapper.addEventListener('pointerup', finishDrag);
  wrapper.addEventListener('pointercancel', finishDrag);

  wrapper.addEventListener('keydown', event => {
    if ((event.target as HTMLElement).closest('.expand-btn')) return;
    const delta = 10;
    if (event.key === 'ArrowUp') state.rotX -= delta;
    else if (event.key === 'ArrowDown') state.rotX += delta;
    else if (event.key === 'ArrowLeft') state.rotY -= delta;
    else if (event.key === 'ArrowRight') state.rotY += delta;
    else return;
    event.preventDefault();
    updateAtomTransform(atomContainer, state.rotX, state.rotY);
  });
}

export function initExpandedDragControl(): void {
  const state = getState();
  const wrapper = document.getElementById('expandedAtomWrapper')!;
  const expandedAtomContainer = document.getElementById('expandedAtomContainer')!;
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDistance: number | null = null;

  const getPinchDistance = (): number => {
    const [first, second] = Array.from(pointers.values());
    return Math.hypot(second.x - first.x, second.y - first.y);
  };

  wrapper.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    wrapper.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    wrapper.style.cursor = 'grabbing';

    if (pointers.size === 1) {
      state.isExpandedDragging = true;
      state.expandedLastMouseX = e.clientX;
      state.expandedLastMouseY = e.clientY;
    } else if (pointers.size === 2) {
      state.isExpandedDragging = false;
      pinchDistance = getPinchDistance();
    }
  });

  wrapper.addEventListener('pointermove', (e: PointerEvent) => {
    const previous = pointers.get(e.pointerId);
    if (!previous || !expandedAtomModal.classList.contains('open')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2) {
      const nextDistance = getPinchDistance();
      if (pinchDistance && pinchDistance > 0) {
        state.expandedScale = clampScale(state.expandedScale * (nextDistance / pinchDistance));
      }
      pinchDistance = nextDistance;
    } else if (state.isExpandedDragging) {
      state.expandedRotY += (e.clientX - previous.x) * 0.5;
      state.expandedRotX -= (e.clientY - previous.y) * 0.5;
    }
    updateAtomTransform(
      expandedAtomContainer,
      state.expandedRotX,
      state.expandedRotY,
      state.expandedScale
    );
  });

  const finishPointer = (e: PointerEvent): void => {
    pointers.delete(e.pointerId);
    if (wrapper.hasPointerCapture(e.pointerId)) wrapper.releasePointerCapture(e.pointerId);
    pinchDistance = pointers.size >= 2 ? getPinchDistance() : null;
    const remaining = pointers.values().next().value as { x: number; y: number } | undefined;
    state.isExpandedDragging = pointers.size === 1;
    if (remaining) {
      state.expandedLastMouseX = remaining.x;
      state.expandedLastMouseY = remaining.y;
    } else {
      wrapper.style.cursor = 'grab';
    }
  };
  wrapper.addEventListener('pointerup', finishPointer);
  wrapper.addEventListener('pointercancel', finishPointer);

  wrapper.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    state.expandedScale = clampScale(state.expandedScale + delta);
    updateAtomTransform(
      expandedAtomContainer,
      state.expandedRotX,
      state.expandedRotY,
      state.expandedScale
    );
  }, { passive: false });

  wrapper.addEventListener('keydown', event => {
    const rotationDelta = 10;
    if (event.key === 'ArrowUp') state.expandedRotX -= rotationDelta;
    else if (event.key === 'ArrowDown') state.expandedRotX += rotationDelta;
    else if (event.key === 'ArrowLeft') state.expandedRotY -= rotationDelta;
    else if (event.key === 'ArrowRight') state.expandedRotY += rotationDelta;
    else if (event.key === '+' || event.key === '=') {
      state.expandedScale = clampScale(state.expandedScale + 0.1);
    } else if (event.key === '-' || event.key === '_') {
      state.expandedScale = clampScale(state.expandedScale - 0.1);
    } else if (event.key === 'Home') {
      state.expandedRotX = 0;
      state.expandedRotY = 0;
      state.expandedScale = 1;
    } else return;
    event.preventDefault();
    updateAtomTransform(
      expandedAtomContainer,
      state.expandedRotX,
      state.expandedRotY,
      state.expandedScale
    );
  });
}

export function openExpandedAtom(): void {
  const state = getState();
  const expandedAtomContainer = document.getElementById('expandedAtomContainer')!;
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;

  if (!state.currentElementData) return;
  if (expandedCleanupTimeout) {
    clearTimeout(expandedCleanupTimeout);
    expandedCleanupTimeout = null;
  }
  expandedLastFocusedElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;

  state.expandedRotX = 0;
  state.expandedRotY = 0;
  state.expandedScale = 1;
  updateAtomTransform(expandedAtomContainer, 0, 0, 1);

  document.getElementById('atomContainer')!.getAnimations?.({ subtree: true })
    .forEach(animation => animation.pause());
  render3DAtom(state.currentElementZ, expandedAtomContainer, 1.8);
  updateExpandedAtomInfo();
  const modalCard = document.querySelector<HTMLElement>('.hologram-card')!;
  modalCard.inert = true;
  modalCard.setAttribute('aria-hidden', 'true');
  expandedAtomModal.inert = false;
  expandedAtomModal.setAttribute('aria-hidden', 'false');
  expandedAtomModal.classList.add('open');
  document.querySelector<HTMLElement>('.expanded-atom-card')!.focus({ preventScroll: true });
}

export function updateExpandedAtomInfo(): void {
  const state = getState();
  const element = state.elements[state.currentElementZ - 1];
  const shells = element?.shells?.length > 0 ? element.shells : getElectronData(state.currentElementZ).shells;

  document.getElementById('expanded-symbol')!.textContent = element.sym;
  document.getElementById('expanded-symbol')!.style.color = element.cat.color;
  document.getElementById('expanded-name')!.textContent = `${element.name} ${element.enName}`;
  document.getElementById('expanded-hint')!.textContent = t('expanded-hint');
  document.getElementById('expandedAtomWrapper')!.setAttribute('aria-label', t('expanded-atom-controls'));
  document.getElementById('expanded-close')!.setAttribute('aria-label', t('close'));

  const legendContainer = document.getElementById('expanded-shell-legend')!;
  legendContainer.textContent = '';

  shells.forEach((count, idx) => {
    if (count === 0) return;
    const isValence = idx === shells.length - 1;
    const item = document.createElement('div');
    item.className = `shell-legend-item ${isValence ? 'valence' : ''}`;

    const shellName =
      state.currentLanguage === 'zh'
        ? `${t('shell-prefix')}${idx + 1}${t('shell-suffix')}`
        : `${t('shell-prefix')}${idx + 1}`;

    const valenceText = isValence ? ` ${t('valence-shell')}` : '';

    const dot = document.createElement('span');
    dot.className = `shell-dot ${isValence ? 'valence' : 'inner'}`;
    const label = document.createElement('span');
    label.textContent = `${shellName}: ${count}${t('electrons-unit')}${valenceText}`;
    item.appendChild(dot);
    item.appendChild(label);
    legendContainer.appendChild(item);
  });
}

export function closeExpandedAtom(): void {
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;
  const expandedAtomContainer = document.getElementById('expandedAtomContainer')!;
  if (!expandedAtomModal.classList.contains('open')) return;

  expandedAtomModal.classList.remove('open');
  expandedAtomModal.setAttribute('aria-hidden', 'true');
  expandedAtomModal.inert = true;
  const modalCard = document.querySelector<HTMLElement>('.hologram-card')!;
  modalCard.inert = false;
  modalCard.setAttribute('aria-hidden', 'false');
  document.getElementById('atomContainer')!.getAnimations?.({ subtree: true })
    .forEach(animation => animation.play());

  expandedCleanupTimeout = setTimeout(() => {
    if (!expandedAtomModal.classList.contains('open')) {
      cancelAtomAnimations(expandedAtomContainer);
      expandedAtomContainer.textContent = '';
    }
    expandedCleanupTimeout = null;
  }, 300);

  expandedLastFocusedElement?.focus({ preventScroll: true });
  expandedLastFocusedElement = null;
}
