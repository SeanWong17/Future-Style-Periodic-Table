import { getState } from '../state';
import { t, getElementName, updateElementTranslations, updateElementTexts } from '../i18n';
import { formatValue } from '../utils/dom';
import { getElectronData } from '../config/electron';
import { getCategoryName } from '../i18n';
import { cancelAtomAnimations, render3DAtom } from './atom3d';
import { resetMediaContainers, updateMediaButtonState } from './media';
import type { Element } from '../types/element';
import { TabId } from '../types/app';

let atomCleanupTimeout: ReturnType<typeof setTimeout> | null = null;
let lastFocusedElement: HTMLElement | null = null;
let previousBodyOverflow = '';

function clearAllTimeouts(): void {
  const state = getState();
  if (state.imageTimeout) {
    clearTimeout(state.imageTimeout);
    state.imageTimeout = null;
  }
  if (state.bohrImageTimeout) {
    clearTimeout(state.bohrImageTimeout);
    state.bohrImageTimeout = null;
  }
}

export function switchTab(tabId: TabId): void {
  if (!Object.values(TabId).includes(tabId)) return;

  const state = getState();
  state.currentTab = tabId;
  document.querySelectorAll<HTMLElement>('.tab-btn').forEach(btn => {
    const active = btn.id === `tab-${tabId}`;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
    btn.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll<HTMLElement>('.tab-pane').forEach(pane => {
    const active = pane.id === `pane-${tabId}`;
    pane.classList.toggle('active', active);
    pane.hidden = !active;
  });
}

export function showModal(data: Element): void {
  const state = getState();
  const modal = document.getElementById('modal')!;
  const atomContainer = document.getElementById('atomContainer')!;
  const wasOpen = modal.classList.contains('open');

  if (atomCleanupTimeout) {
    clearTimeout(atomCleanupTimeout);
    atomCleanupTimeout = null;
  }
  if (!wasOpen) {
    lastFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    previousBodyOverflow = document.body.style.overflow;
  }

  state.currentElementZ = data.idx;
  state.currentElementData = data;
  state.rotX = 0;
  state.rotY = 0;
  atomContainer.style.transform = 'rotateX(0deg) rotateY(0deg)';

  clearAllTimeouts();
  state.currentImageUrl = null;
  state.currentBohrImageUrl = null;
  resetMediaContainers();

  renderModalContent(data);

  render3DAtom(data.idx);
  switchTab(TabId.Basic);
  modal.inert = false;
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('open');
  const appContent = document.getElementById('app-content')!;
  appContent.inert = true;
  appContent.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'hidden';
  document.querySelector<HTMLElement>('.hologram-card')!.focus({ preventScroll: true });
}

function renderModalContent(data: Element): void {
  const state = getState();

  updateElementTranslations({
    'tab-basic': 'tab-basic',
    'tab-physical': 'tab-physical',
    'tab-chemical': 'tab-chemical',
    'tab-history': 'tab-history',
    'tab-media': 'tab-media',
  });

  // Header
  const mSymbol = document.getElementById('m-symbol')!;
  mSymbol.textContent = data.sym;
  mSymbol.style.color = data.cat.color;
  document.getElementById('m-name')!.textContent = getElementName(data);
  document.getElementById('m-en-name')!.textContent =
    state.currentLanguage === 'zh' ? data.enName : data.name;

  const mCat = document.getElementById('m-cat')!;
  mCat.textContent =
    state.currentLanguage === 'zh'
      ? (data.category || getCategoryName(data.cat))
      : (data.categoryEn || getCategoryName(data.cat));
  mCat.style.borderColor = data.cat.color;
  mCat.style.color = data.cat.color;

  document.getElementById('m-phase')!.textContent =
    state.currentLanguage === 'zh' ? (data.phase || '—') : (data.phaseEn || '—');
  document.getElementById('m-block')!.textContent = data.block ? data.block.toUpperCase() : '—';

  // Summary
  const summary = state.currentLanguage === 'zh' ? data.summary : data.summaryEn;
  document.getElementById('m-summary')!.textContent = summary || t('no-data');
  document.getElementById('m-summary-box')!.style.display = summary ? 'block' : 'none';

  // Basic tab
  renderBasicTab(data);
  // Physical tab
  renderPhysicalTab(data);
  // Chemical tab
  renderChemicalTab(data);
  // History tab
  renderHistoryTab(data);
  // Media tab
  renderMediaTab(data);

  document.getElementById('visualizer-hint')!.textContent = t('drag-rotate');
  document.getElementById('atomWrapper')!.setAttribute('aria-label', t('atom-controls'));
  const expandButton = document.querySelector<HTMLElement>('.expand-btn')!;
  expandButton.setAttribute('aria-label', t('expand-atom'));
  expandButton.setAttribute('title', t('expand-atom'));
  document.getElementById('modal-close')!.setAttribute('aria-label', t('close'));
  (document.getElementById('element-image') as HTMLImageElement).alt =
    t('element-image-alt', { name: getElementName(data) });
  (document.getElementById('bohr-image') as HTMLImageElement).alt =
    t('bohr-image-alt', { name: getElementName(data) });
}

export function refreshModal(): void {
  const state = getState();
  if (!state.currentElementData) return;
  renderModalContent(state.currentElementData);
  switchTab(state.currentTab);
}

function renderBasicTab(data: Element): void {
  document.getElementById('electron-config-label')!.textContent = t('electron-configuration');

  const configDisplay = data.electronConfig ||
    getElectronData(data.idx).str.replace(/<sup>/g, '').replace(/<\/sup>/g, '');
  document.getElementById('m-config')!.innerHTML =
    configDisplay.replace(/(\d)([spdf])(\d+)/g, '$1$2<sup>$3</sup>');
  document.getElementById('m-config-semantic')!.textContent = data.electronConfigSemantic || '';

  const shellsDisplay = data.shells.length > 0 ? data.shells : getElectronData(data.idx).shells;
  document.getElementById('m-config-shell')!.textContent =
    `${t('layers')}: ${shellsDisplay.join(' - ')}`;

  // Valence
  document.getElementById('valence-label')!.textContent = t('common-oxidation-states');
  const valenceEl = document.getElementById('m-valence')!;
  valenceEl.textContent = '';
  if (data.valence && data.valence.length > 0) {
    data.valence.forEach(v => {
      const tag = document.createElement('span');
      tag.className = 'valence-tag';
      tag.textContent = v;
      valenceEl.appendChild(tag);
    });
  } else {
    const noData = document.createElement('span');
    noData.className = 'no-data';
    noData.textContent = t('no-data');
    valenceEl.appendChild(noData);
  }

  // Isotopes
  document.getElementById('isotopes-label')!.textContent = t('isotopes');
  const isotopesEl = document.getElementById('m-isotopes')!;
  isotopesEl.textContent = '';
  if (data.isotopes && data.isotopes.length > 0) {
    data.isotopes.forEach(iso => {
      const tag = document.createElement('span');
      tag.className = `isotope-tag ${iso.s ? 'isotope-stable' : ''}`;
      const massSpan = document.createElement('span');
      massSpan.className = 'mass-num';
      massSpan.textContent = String(iso.m);
      tag.appendChild(massSpan);
      tag.appendChild(document.createTextNode(data.sym + (iso.s ? ' ●' : '')));
      isotopesEl.appendChild(tag);
    });
  } else {
    const noData = document.createElement('span');
    noData.className = 'no-data';
    noData.textContent = t('no-data');
    isotopesEl.appendChild(noData);
  }

  // Position
  updateElementTranslations({
    'position-label': 'position',
    'period-label': 'period',
    'group-label': 'group',
    'block-label': 'block',
    'atomic-num-label': 'atomic-number',
  });
  updateElementTexts({
    'm-period': formatValue(data.period),
    'm-group': formatValue(data.group),
    'm-block-val': data.block ? data.block.toUpperCase() : '—',
    'm-num': String(data.idx),
  });
}

function renderPhysicalTab(data: Element): void {
  const state = getState();
  document.getElementById('appearance-label')!.textContent = t('appearance');
  document.getElementById('m-appearance')!.textContent =
    state.currentLanguage === 'zh' ? (data.appearance || t('no-data')) : (data.appearanceEn || t('no-data'));

  updateElementTranslations({
    'physical-props-label': 'physical-properties',
    'atomic-mass-label': 'atomic-mass',
    'atomic-radius-label': 'atomic-radius',
    'density-label': 'density-unit',
    'melting-point-label': 'melting-point-k',
    'boiling-point-label': 'boiling-point-k',
    'molar-heat-label': 'molar-heat',
  });
  updateElementTexts({
    'm-mass': formatValue(data.mass),
    'm-radius': formatValue(data.radius),
    'm-density': formatValue(data.density),
    'm-melt': formatValue(data.melt),
    'm-boil': formatValue(data.boil),
    'm-molar-heat': formatValue(data.molarHeat),
  });
}

function renderChemicalTab(data: Element): void {
  updateElementTranslations({
    'chemical-props-label': 'chemical-properties',
    'electronegativity-label': 'electronegativity-pauling',
    'electron-affinity-label': 'electron-affinity',
  });
  updateElementTexts({
    'm-en': formatValue(data.en),
    'm-ea': formatValue(data.electronAffinity),
  });

  document.getElementById('ionization-energies-label')!.textContent = t('ionization-energies');
  const ionList = document.getElementById('m-ionization-list')!;
  ionList.textContent = '';

  if (data.ionizationEnergies && data.ionizationEnergies.length > 0) {
    data.ionizationEnergies.forEach((ie, idx) => {
      const item = document.createElement('div');
      item.className = 'ionization-item';
      let label = '';
      if (idx === 0) label = t('ionization-first');
      else if (idx === 1) label = t('ionization-second');
      else if (idx === 2) label = t('ionization-third');
      else label = t('ionization-nth', { n: idx + 1 });

      const labelSpan = document.createElement('span');
      labelSpan.className = 'ion-label';
      labelSpan.textContent = label;
      const valueSpan = document.createElement('span');
      valueSpan.className = 'ion-value';
      valueSpan.textContent = formatValue(ie);
      item.appendChild(labelSpan);
      item.appendChild(valueSpan);
      ionList.appendChild(item);
    });
  } else {
    const noData = document.createElement('span');
    noData.className = 'no-data';
    noData.textContent = t('no-data');
    ionList.appendChild(noData);
  }
}

function renderHistoryTab(data: Element): void {
  const state = getState();
  updateElementTranslations({
    'discovery-label': 'discovery',
    'discovered-by-label': 'discovered-by',
    'named-by-label': 'named-by',
    'source-label': 'source',
  });

  document.getElementById('m-discovered-by')!.textContent =
    state.currentLanguage === 'zh' ? (data.discoveredBy || '—') : (data.discoveredByEn || '—');
  document.getElementById('m-named-by')!.textContent =
    state.currentLanguage === 'zh' ? (data.namedBy || '—') : (data.namedByEn || '—');

  const sourceUrl = state.currentLanguage === 'zh' ? data.source : data.sourceEn;
  const sourceEl = document.getElementById('m-source') as HTMLAnchorElement;
  if (sourceUrl) {
    sourceEl.href = sourceUrl;
    sourceEl.style.display = 'inline-flex';
  } else {
    sourceEl.style.display = 'none';
  }
  document.getElementById('source-link-text')!.textContent = 'Wikipedia';
}

function renderMediaTab(data: Element): void {
  updateElementTranslations({
    'image-label': 'element-image',
    'bohr-image-label': 'bohr-image',
    'load-image-text': 'load-image',
    'load-bohr-image-text': 'load-bohr-image',
  });

  updateMediaButtonState('load-image-btn', 'load-image-text', data.image?.url ?? null, t('load-image'));
  updateMediaButtonState('load-bohr-image-btn', 'load-bohr-image-text', data.bohrModelImage, t('load-bohr-image'));
}

export function closeModal(): void {
  const state = getState();
  const modal = document.getElementById('modal')!;
  const atomContainer = document.getElementById('atomContainer')!;

  if (!modal.classList.contains('open')) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.inert = true;
  const appContent = document.getElementById('app-content')!;
  appContent.inert = false;
  appContent.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = previousBodyOverflow;

  clearAllTimeouts();
  state.currentImageUrl = null;
  state.currentBohrImageUrl = null;

  atomCleanupTimeout = setTimeout(() => {
    if (!modal.classList.contains('open')) {
      cancelAtomAnimations(atomContainer);
      atomContainer.textContent = '';
    }
    atomCleanupTimeout = null;
  }, 300);

  lastFocusedElement?.focus({ preventScroll: true });
  lastFocusedElement = null;
}
