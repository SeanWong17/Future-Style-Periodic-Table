import { getState } from '../state';
import { applyTableView } from './heatmap';

export function initSearch(): void {
  const state = getState();
  const input = document.getElementById('searchInput') as HTMLInputElement;
  input.value = state.searchQuery;
  input.addEventListener('input', () => {
    state.searchQuery = input.value;
    applyTableView();
  });
}
