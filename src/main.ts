import './css/styles.css';
import { getState } from './state';
import { processElementsData } from './data';
import { t, updateElementTranslations } from './i18n';
import { renderTable } from './modules/table';
import { renderLegend } from './modules/legend';
import { setMode } from './modules/heatmap';
import { initDragControl, initExpandedDragControl, openExpandedAtom, closeExpandedAtom, updateExpandedAtomInfo } from './modules/atom3d';
import { closeModal, refreshModal, switchTab } from './modules/modal';
import { loadElementImage, loadBohrImage } from './modules/media';
import { initSearch } from './modules/search';
import { TabId } from './types/app';

function setLanguage(lang: 'zh' | 'en'): void {
  const state = getState();
  state.currentLanguage = lang;

  document.getElementById('lang-zh')!.classList.toggle('active', lang === 'zh');
  document.getElementById('lang-en')!.classList.toggle('active', lang === 'en');
  document.getElementById('lang-zh')!.setAttribute('aria-pressed', String(lang === 'zh'));
  document.getElementById('lang-en')!.setAttribute('aria-pressed', String(lang === 'en'));
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  updateUILanguage();
  renderTable();
  renderLegend();

  const modal = document.getElementById('modal')!;
  if (modal.classList.contains('open') && state.currentElementData) {
    refreshModal();
  }
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;
  if (expandedAtomModal.classList.contains('open')) {
    updateExpandedAtomInfo();
  }
}

function updateUILanguage(): void {
  updateElementTranslations({
    'main-title': 'periodic-table-title',
    'mode-standard': 'standard',
    'mode-radius': 'radius',
    'mode-electronegativity': 'electronegativity',
    'mode-ionization': 'ionization-energy',
    'mode-melting': 'melting-point',
    'mode-boiling': 'boiling-point',
    'mode-density': 'density',
    'rotate-hint': 'rotate-hint',
  });
  document.title = t('page-title');

  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  searchInput.placeholder = t('search-placeholder');
  searchInput.setAttribute('aria-label', t('search-label'));
  document.getElementById('search-label')!.textContent = t('search-label');
  document.querySelector<HTMLElement>('.mode-group')!.setAttribute('aria-label', t('mode-label'));
  document.querySelector<HTMLElement>('.language-toggle')!.setAttribute('aria-label', t('language-label'));
  document.getElementById('legend')!.setAttribute('aria-label', t('legend-label'));
  document.getElementById('table')!.setAttribute('aria-label', t('table-label'));
  document.querySelector<HTMLElement>('.tab-nav')!.setAttribute('aria-label', t('tab-list-label'));
  const githubLink = document.querySelector<HTMLElement>('.github-silent-link')!;
  githubLink.setAttribute('aria-label', t('github-link'));
  githubLink.setAttribute('title', t('github-link'));
  document.querySelectorAll<HTMLElement>('.close-btn').forEach(btn => {
    btn.setAttribute('aria-label', t('close'));
  });
  const expandButton = document.querySelector<HTMLElement>('.expand-btn')!;
  expandButton.setAttribute('aria-label', t('expand-atom'));
  expandButton.setAttribute('title', t('expand-atom'));
  document.getElementById('atomWrapper')!.setAttribute('aria-label', t('atom-controls'));
  document.getElementById('expandedAtomWrapper')!.setAttribute('aria-label', t('expanded-atom-controls'));
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode!));
  });

  document.getElementById('lang-zh')!.addEventListener('click', () => setLanguage('zh'));
  document.getElementById('lang-en')!.addEventListener('click', () => setLanguage('en'));

  document.querySelectorAll<HTMLElement>('.close-btn').forEach(btn => {
    if (btn.closest('.expanded-atom-overlay')) {
      btn.addEventListener('click', closeExpandedAtom);
    } else {
      btn.addEventListener('click', closeModal);
    }
  });

  document.querySelector('.expand-btn')?.addEventListener('click', openExpandedAtom);

  document.querySelectorAll<HTMLElement>('.tab-btn').forEach(btn => {
    const tabId = btn.id.replace('tab-', '') as TabId;
    btn.addEventListener('click', () => switchTab(tabId));
    btn.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab-btn'));
      const currentIndex = tabs.indexOf(btn as HTMLButtonElement);
      let nextIndex = currentIndex;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      switchTab(nextTab.id.replace('tab-', '') as TabId);
      nextTab.focus();
    });
  });

  document.getElementById('load-image-btn')!.addEventListener('click', loadElementImage);
  document.getElementById('load-bohr-image-btn')!.addEventListener('click', loadBohrImage);

  const modal = document.getElementById('modal')!;
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  expandedAtomModal.addEventListener('click', (e) => {
    if (e.target === expandedAtomModal) closeExpandedAtom();
  });
}

function trapDialogFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;

  const expandedOpen = document.getElementById('expandedAtomModal')!.classList.contains('open');
  const modalOpen = document.getElementById('modal')!.classList.contains('open');
  if (!expandedOpen && !modalOpen) return;

  const dialog = document.querySelector<HTMLElement>(
    expandedOpen ? '.expanded-atom-card' : '.hologram-card'
  )!;
  const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
  )).filter(element => !element.closest('[hidden]'));

  if (focusable.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const nextIndex = event.shiftKey
    ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
    : (currentIndex < 0 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
  event.preventDefault();
  focusable[nextIndex].focus();
}

function initKeyboard(): void {
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;
  document.addEventListener('keydown', (e) => {
    trapDialogFocus(e);
    if (e.key === 'Escape') {
      if (expandedAtomModal.classList.contains('open')) {
        closeExpandedAtom();
      } else if (document.getElementById('modal')!.classList.contains('open')) {
        closeModal();
      }
    }
  });
}

function init(): void {
  const state = getState();
  state.elements = processElementsData();

  bindEvents();
  updateUILanguage();
  renderLegend();
  renderTable();
  initDragControl();
  initExpandedDragControl();
  initSearch();
  initKeyboard();
}

init();
