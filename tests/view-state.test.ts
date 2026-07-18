import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { processElementsData } from '../src/data';
import { getState } from '../src/state';
import { VisualizationMode } from '../src/types/app';
import { applyTableView, setMode } from '../src/modules/heatmap';
import { renderLegend } from '../src/modules/legend';
import { initSearch } from '../src/modules/search';
import { getPos, renderTable } from '../src/modules/table';

describe('periodic table view state', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <button class="mode-btn active" data-mode="default"></button>
      <button class="mode-btn" data-mode="radius"></button>
      <input id="searchInput">
      <div id="legend"></div>
      <div id="table"></div>
    `;

    Object.assign(getState(), {
      elements: processElementsData(),
      currentLanguage: 'en',
      currentMode: VisualizationMode.Default,
      currentActiveCategory: null,
      searchQuery: '',
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('keeps heatmap, category, and search constraints after a rerender', () => {
    renderLegend();
    renderTable();
    initSearch();
    vi.runAllTimers();

    setMode(VisualizationMode.Radius);
    const alkaliButton = document.querySelector<HTMLButtonElement>('.legend-item[data-cat-id="0"]');
    expect(alkaliButton).not.toBeNull();
    alkaliButton?.click();

    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput.value = 'lithium';
    searchInput.dispatchEvent(new Event('input'));

    const lithium = document.querySelector<HTMLElement>('.element[data-idx="3"]');
    const hydrogen = document.querySelector<HTMLElement>('.element[data-idx="1"]');
    expect(getState().currentMode).toBe(VisualizationMode.Radius);
    expect(getState().currentActiveCategory).toBe(0);
    expect(getState().searchQuery).toBe('lithium');
    expect(lithium?.style.getPropertyValue('--element-opacity')).toBe('1');
    expect(hydrogen?.style.getPropertyValue('--element-opacity')).toBe('0.1');
    expect(lithium?.querySelector('.detail-val')?.textContent).not.toBe('');

    getState().currentLanguage = 'zh';
    renderLegend();
    renderTable();
    vi.runAllTimers();
    applyTableView();

    const rerenderedLithium = document.querySelector<HTMLElement>('.element[data-idx="3"]');
    const activeLegend = document.querySelector<HTMLButtonElement>('.legend-item.active');
    expect(document.getElementById('table')?.classList.contains('heatmap-active')).toBe(true);
    expect(rerenderedLithium?.style.getPropertyValue('--element-opacity')).toBe('1');
    expect(rerenderedLithium?.querySelector('.detail-val')?.textContent).not.toBe('');
    expect(activeLegend?.dataset.catId).toBe('0');
    expect(activeLegend?.getAttribute('aria-pressed')).toBe('true');
  });

  it('renders keyboard-accessible element and legend buttons', () => {
    renderLegend();
    renderTable();

    const element = document.querySelector('.element[data-idx="1"]');
    const legend = document.querySelector('.legend-item');
    expect(element).toBeInstanceOf(HTMLButtonElement);
    expect(element?.getAttribute('aria-label')).toContain('Hydrogen');
    expect(legend).toBeInstanceOf(HTMLButtonElement);
    expect(legend?.hasAttribute('aria-pressed')).toBe(true);
  });

  it('maps all periodic-table edge positions correctly', () => {
    expect(getPos(1)).toEqual([1, 1]);
    expect(getPos(2)).toEqual([1, 18]);
    expect(getPos(57)).toEqual([9, 4]);
    expect(getPos(118)).toEqual([7, 18]);
  });
});
