import { getState } from '../state';
import { getElementName } from '../i18n';
import { showModal } from './modal';
import { t } from '../i18n';
import { categories } from '../config/categories';
import { applyTableView } from './heatmap';

let revealTimeouts: Array<ReturnType<typeof setTimeout>> = [];

export function getPos(n: number): [number, number] {
  if (n === 1) return [1, 1];
  if (n === 2) return [1, 18];
  if (n >= 3 && n <= 4) return [2, n - 2];
  if (n >= 5 && n <= 10) return [2, n + 8];
  if (n >= 11 && n <= 12) return [3, n - 10];
  if (n >= 13 && n <= 18) return [3, n];
  if (n >= 19 && n <= 36) return [4, n - 18];
  if (n >= 37 && n <= 54) return [5, n - 36];
  if (n >= 55 && n <= 56) return [6, n - 54];
  if (n >= 72 && n <= 86) return [6, n - 68];
  if (n >= 87 && n <= 88) return [7, n - 86];
  if (n >= 104 && n <= 118) return [7, n - 100];
  if (n >= 57 && n <= 71) return [9, n - 53];
  if (n >= 89 && n <= 103) return [10, n - 85];
  return [0, 0];
}

export function renderTable(): void {
  const state = getState();
  const table = document.getElementById('table')!;
  revealTimeouts.forEach(clearTimeout);
  revealTimeouts = [];
  table.textContent = '';

  state.elements.forEach((e, i) => {
    const [r, c] = getPos(e.idx);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'element';
    el.style.gridRow = String(r);
    el.style.gridColumn = String(c);
    el.dataset.idx = String(e.idx);
    el.style.borderColor = e.cat.color;
    el.setAttribute('aria-label', t('element-button-label', {
      name: getElementName(e),
      symbol: e.sym,
      number: e.idx,
    }));

    const numDiv = document.createElement('div');
    numDiv.className = 'atomic-number';
    numDiv.textContent = String(e.idx);

    const symDiv = document.createElement('div');
    symDiv.className = 'symbol';
    symDiv.style.color = e.cat.color;
    symDiv.textContent = e.sym;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = getElementName(e);

    const detailDiv = document.createElement('div');
    detailDiv.className = 'detail-val';

    el.appendChild(numDiv);
    el.appendChild(symDiv);
    el.appendChild(nameDiv);
    el.appendChild(detailDiv);
    el.addEventListener('click', () => showModal(e));

    revealTimeouts.push(setTimeout(() => el.classList.add('visible'), i * 5));
    table.appendChild(el);
  });

  const placeholders = [
    { row: 6, col: 3, sym: '57-71', name: t('lanthanides'), catIdx: 8 },
    { row: 7, col: 3, sym: '89-103', name: t('actinides'), catIdx: 9 },
  ];

  placeholders.forEach(p => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'element placeholder';
    el.style.gridRow = String(p.row);
    el.style.gridColumn = String(p.col);
    el.dataset.catId = String(p.catIdx);
    el.setAttribute('aria-label', p.name);

    const color = categories[p.catIdx].color;
    el.style.borderColor = color;

    const rangeDiv = document.createElement('div');
    rangeDiv.className = 'range-num';
    rangeDiv.style.color = color;
    rangeDiv.textContent = p.sym;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = p.name;

    el.appendChild(rangeDiv);
    el.appendChild(nameDiv);

    el.addEventListener('click', () => {
      const btns = document.querySelectorAll('.legend-item');
      if (btns[p.catIdx]) (btns[p.catIdx] as HTMLElement).click();
    });

    revealTimeouts.push(setTimeout(() => el.classList.add('visible'), 600));
    table.appendChild(el);
  });

  applyTableView();
}
