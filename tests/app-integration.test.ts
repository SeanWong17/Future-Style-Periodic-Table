import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(testDirectory, '../index.html'), 'utf8');

describe('application startup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes controls and preserves a composed view through language changes', async () => {
    await import('../src/main');
    vi.runAllTimers();

    expect(document.querySelectorAll('.element')).toHaveLength(120);
    expect(document.querySelectorAll('.legend-item')).toHaveLength(10);

    document.querySelector<HTMLButtonElement>('.mode-btn[data-mode="radius"]')?.click();
    document.querySelector<HTMLButtonElement>('.legend-item[data-cat-id="0"]')?.click();
    const search = document.getElementById('searchInput') as HTMLInputElement;
    search.value = 'lithium';
    search.dispatchEvent(new Event('input'));
    document.getElementById('lang-en')?.click();
    vi.runAllTimers();

    const lithium = document.querySelector<HTMLButtonElement>('.element[data-idx="3"]');
    expect(document.getElementById('table')?.classList.contains('heatmap-active')).toBe(true);
    expect(lithium?.style.getPropertyValue('--element-opacity')).toBe('1');
    expect(lithium?.textContent).toContain('Lithium');
    expect(document.querySelector('.legend-item.active')?.getAttribute('aria-pressed')).toBe('true');

    lithium?.click();
    expect(document.getElementById('modal')?.classList.contains('open')).toBe(true);
    expect(document.getElementById('m-name')?.textContent).toBe('Lithium');
    expect(document.activeElement).toBe(document.querySelector('.hologram-card'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(document.getElementById('modal-close'));
  });
});
