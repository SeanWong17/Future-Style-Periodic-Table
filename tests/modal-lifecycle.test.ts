import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { processElementsData } from '../src/data';
import { getState } from '../src/state';
import { TabId } from '../src/types/app';
import { closeExpandedAtom, openExpandedAtom } from '../src/modules/atom3d';
import { closeModal, refreshModal, showModal, switchTab } from '../src/modules/modal';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(testDirectory, '../index.html'), 'utf8');

describe('modal lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });

    Object.assign(getState(), {
      elements: processElementsData(),
      currentLanguage: 'zh',
      currentElementData: null,
      currentElementZ: 1,
      currentTab: TabId.Basic,
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('preserves the active tab when modal content is translated', () => {
    showModal(getState().elements[0]);
    switchTab(TabId.History);
    getState().currentLanguage = 'en';
    refreshModal();

    expect(getState().currentTab).toBe(TabId.History);
    expect(document.getElementById('tab-history')?.getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('pane-history')?.hidden).toBe(false);
    expect(document.getElementById('pane-basic')?.hidden).toBe(true);
  });

  it('does not let a stale close timer erase a reopened atom model', () => {
    const opener = document.createElement('button');
    document.getElementById('app-content')?.appendChild(opener);
    opener.focus();

    showModal(getState().elements[0]);
    expect(document.getElementById('modal')?.getAttribute('aria-hidden')).toBe('false');
    expect(document.getElementById('app-content')?.inert).toBe(true);
    expect(document.getElementById('app-content')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(document.querySelector('.hologram-card'));
    closeModal();
    expect(document.getElementById('modal')?.inert).toBe(true);
    expect(document.activeElement).toBe(opener);

    vi.advanceTimersByTime(100);
    showModal(getState().elements[1]);
    vi.advanceTimersByTime(300);

    expect(document.getElementById('atomContainer')?.childElementCount).toBeGreaterThan(0);
    expect(document.getElementById('modal')?.classList.contains('open')).toBe(true);
  });

  it('does not let a stale expanded-view timer erase a reopened model', () => {
    showModal(getState().elements[2]);
    openExpandedAtom();
    closeExpandedAtom();

    vi.advanceTimersByTime(100);
    openExpandedAtom();
    vi.advanceTimersByTime(300);

    expect(document.getElementById('expandedAtomContainer')?.childElementCount).toBeGreaterThan(0);
    expect(document.getElementById('expandedAtomModal')?.getAttribute('aria-hidden')).toBe('false');
  });
});
