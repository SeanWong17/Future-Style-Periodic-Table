import { getState } from '../state';
import { t } from '../i18n';

const LOAD_TIMEOUT = 5000;

export function resetMediaContainers(): void {
  const imageBtn = document.getElementById('load-image-btn') as HTMLButtonElement;
  const img = document.getElementById('element-image') as HTMLImageElement;

  img.onload = null;
  img.onerror = null;
  img.src = '';
  imageBtn.style.display = 'flex';
  imageBtn.classList.remove('loading', 'error', 'disabled');
  imageBtn.disabled = false;
  imageBtn.setAttribute('aria-busy', 'false');
  document.getElementById('image-display')!.style.display = 'none';

  const bohrBtn = document.getElementById('load-bohr-image-btn') as HTMLButtonElement;
  const bohrImg = document.getElementById('bohr-image') as HTMLImageElement;

  bohrImg.onload = null;
  bohrImg.onerror = null;
  bohrImg.src = '';
  bohrBtn.style.display = 'flex';
  bohrBtn.classList.remove('loading', 'error', 'disabled');
  bohrBtn.disabled = false;
  bohrBtn.setAttribute('aria-busy', 'false');
  document.getElementById('bohr-image-display')!.style.display = 'none';
}

export function updateMediaButtonState(
  btnId: string,
  textId: string,
  resourceUrl: string | null,
  defaultText: string
): void {
  const btn = document.getElementById(btnId) as HTMLButtonElement;
  const textSpan = document.getElementById(textId)!;
  if (!resourceUrl) {
    btn.classList.add('disabled');
    btn.disabled = true;
    textSpan.textContent = t('no-resource');
  } else {
    btn.classList.remove('disabled');
    btn.disabled = false;
    textSpan.textContent = defaultText;
  }
}

function setButtonError(btn: HTMLButtonElement, textSpan: HTMLElement, message: string): void {
  btn.classList.remove('loading');
  btn.classList.add('error');
  btn.disabled = false;
  btn.setAttribute('aria-busy', 'false');
  textSpan.textContent = message;
}

export function loadElementImage(): void {
  const state = getState();
  const imageUrl = state.currentElementData?.image?.url;
  if (!imageUrl) return;

  const btn = document.getElementById('load-image-btn') as HTMLButtonElement;
  const textSpan = document.getElementById('load-image-text')!;
  const display = document.getElementById('image-display')!;
  const img = document.getElementById('element-image') as HTMLImageElement;
  const caption = document.getElementById('image-caption')!;

  if (btn.disabled || btn.classList.contains('loading')) return;

  btn.classList.remove('error');
  textSpan.textContent = t('loading');
  btn.classList.add('loading');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');

  state.currentImageUrl = imageUrl;

  if (state.imageTimeout) {
    clearTimeout(state.imageTimeout);
  }

  state.imageTimeout = setTimeout(() => {
    if (state.currentImageUrl === imageUrl && btn.classList.contains('loading')) {
      img.onload = null;
      img.onerror = null;
      img.src = '';
      state.imageTimeout = null;
      setButtonError(btn, textSpan, t('load-timeout'));
    }
  }, LOAD_TIMEOUT);

  img.onload = () => {
    if (state.currentImageUrl !== imageUrl) return;
    if (state.imageTimeout) {
      clearTimeout(state.imageTimeout);
      state.imageTimeout = null;
    }
    btn.style.display = 'none';
    btn.setAttribute('aria-busy', 'false');
    display.style.display = 'block';
    caption.textContent = state.currentElementData?.image?.title || '';
  };

  img.onerror = () => {
    if (state.currentImageUrl !== imageUrl) return;
    if (state.imageTimeout) {
      clearTimeout(state.imageTimeout);
      state.imageTimeout = null;
    }
    setButtonError(btn, textSpan, t('load-failed'));
  };

  img.src = imageUrl;
}

export function loadBohrImage(): void {
  const state = getState();
  const bohrUrl = state.currentElementData?.bohrModelImage;
  if (!bohrUrl) return;

  const btn = document.getElementById('load-bohr-image-btn') as HTMLButtonElement;
  const textSpan = document.getElementById('load-bohr-image-text')!;
  const display = document.getElementById('bohr-image-display')!;
  const img = document.getElementById('bohr-image') as HTMLImageElement;

  if (btn.disabled || btn.classList.contains('loading')) return;

  btn.classList.remove('error');
  textSpan.textContent = t('loading');
  btn.classList.add('loading');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');

  state.currentBohrImageUrl = bohrUrl;

  if (state.bohrImageTimeout) {
    clearTimeout(state.bohrImageTimeout);
  }

  state.bohrImageTimeout = setTimeout(() => {
    if (state.currentBohrImageUrl === bohrUrl && btn.classList.contains('loading')) {
      img.onload = null;
      img.onerror = null;
      img.src = '';
      state.bohrImageTimeout = null;
      setButtonError(btn, textSpan, t('load-timeout'));
    }
  }, LOAD_TIMEOUT);

  img.onload = () => {
    if (state.currentBohrImageUrl !== bohrUrl) return;
    if (state.bohrImageTimeout) {
      clearTimeout(state.bohrImageTimeout);
      state.bohrImageTimeout = null;
    }
    btn.style.display = 'none';
    btn.setAttribute('aria-busy', 'false');
    display.style.display = 'block';
  };

  img.onerror = () => {
    if (state.currentBohrImageUrl !== bohrUrl) return;
    if (state.bohrImageTimeout) {
      clearTimeout(state.bohrImageTimeout);
      state.bohrImageTimeout = null;
    }
    setButtonError(btn, textSpan, t('load-failed'));
  };

  img.src = bohrUrl;
}
