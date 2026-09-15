import { describe, expect, it } from 'vitest';
import { processElementsData } from '../src/data';
import { formatValue } from '../src/utils/dom';

describe('density units', () => {
  const elements = processElementsData();
  const density = (symbol: string) => elements.find(element => element.sym === symbol)!.density;

  it('expresses gas densities in g/cm3', () => {
    expect(density('H')).toBeCloseTo(0.00008988, 10);
    expect(density('He')).toBeCloseTo(0.0001786, 10);
    expect(density('O')).toBeCloseTo(0.001429, 10);
    expect(density('O')).toBeLessThan(density('Li'));
  });

  it('preserves solid and liquid densities', () => {
    expect(density('Fe')).toBe(7.874);
    expect(density('Hg')).toBe(13.534);
  });

  it('keeps small density values readable without losing significant digits', () => {
    expect(formatValue(density('H'))).toBe('0.00008988');
    expect(formatValue(density('He'))).toBe('0.0001786');
    expect(formatValue(density('O'))).toBe('0.001429');
    expect(formatValue(density('Fe'))).toBe('7.874');
  });

  it('preserves formatting for missing values and ordinary numbers', () => {
    expect(density('Fm')).toBe(0);
    expect(formatValue(density('Fm'))).toBe(formatValue(null));
    expect(formatValue(null)).toBe(formatValue(0));
    expect(formatValue(undefined)).toBe(formatValue(0));
    expect(formatValue(12)).toBe('12');
    expect(formatValue(1.234567)).toBe('1.2346');
    expect(formatValue(-0.000012346)).toBe('-0.00001235');
  });
});
