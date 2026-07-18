import { getState } from '../state';
import { categories } from '../config/categories';
import { getCategoryName } from '../i18n';
import { applyTableView } from './heatmap';

export function renderLegend(): void {
  const legend = document.getElementById('legend')!;
  legend.textContent = '';

  categories.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'legend-item';
    btn.dataset.catId = String(i);
    btn.setAttribute('aria-pressed', String(getState().currentActiveCategory === i));

    const colorDot = document.createElement('div');
    colorDot.className = 'legend-color';
    colorDot.style.background = c.color;

    btn.appendChild(colorDot);
    btn.appendChild(document.createTextNode(getCategoryName(c)));
    btn.addEventListener('click', () => toggleCategory(i, btn));
    legend.appendChild(btn);
  });

  applyTableView();
}

export function toggleCategory(catId: number, btn: HTMLElement): void {
  const state = getState();

  if (state.currentActiveCategory === catId) {
    state.currentActiveCategory = null;
  } else {
    state.currentActiveCategory = catId;
  }
  btn.setAttribute('aria-pressed', String(state.currentActiveCategory === catId));
  applyTableView();
}
