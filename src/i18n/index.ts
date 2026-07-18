import type { Language } from '../types/app';
import type { TranslationKey } from './zh';
import type { Element, Category } from '../types/element';
import zh from './zh';
import en from './en';
import { getState } from '../state';

const translations: Record<Language, Record<TranslationKey, string>> = { zh, en };

export type { TranslationKey };

export function t(
  key: TranslationKey,
  replacements: Record<string, string | number> = {}
): string {
  const value = translations[getState().currentLanguage][key] || key;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in replacements ? String(replacements[name]) : match
  );
}

export function getElementName(element: Element): string {
  return getState().currentLanguage === 'zh' ? element.name : element.enName;
}

export function getCategoryName(category: Category): string {
  return getState().currentLanguage === 'zh' ? category.name : category.nameEn;
}

export function updateElementTranslations(mappings: Record<string, TranslationKey>): void {
  Object.entries(mappings).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });
}

export function updateElementTexts(mappings: Record<string, string | number>): void {
  Object.entries(mappings).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(text);
  });
}
