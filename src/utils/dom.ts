export function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

export function formatValue(val: number | string | null | undefined, fallback = '—'): string {
  if (val === null || val === undefined || val === 0 || val === '') {
    return fallback;
  }
  if (typeof val === 'number') {
    if (Math.abs(val) < 0.01) return String(Number(val.toPrecision(4)));
    return Number.isInteger(val) ? String(val) : val.toFixed(4).replace(/\.?0+$/, '');
  }
  return String(val);
}
