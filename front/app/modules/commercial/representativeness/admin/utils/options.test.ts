import { parsePopulationValue } from './options';

describe('parsePopulationValue', () => {
  it('returns null if value is empty string', () => {
    expect(parsePopulationValue('')).toBeNull();
  });

  it('returns undefined if value contains anything other than numbers or commas', () => {
    expect(parsePopulationValue('a')).toBeUndefined();
    expect(parsePopulationValue('1a')).toBeUndefined();
    expect(parsePopulationValue('1,a')).toBeUndefined();
    expect(parsePopulationValue('-1,000')).toBeUndefined();
    expect(parsePopulationValue('%,000')).toBeUndefined();
  });

  it('returns undefined if value starts with comma', () => {
    expect(parsePopulationValue(',1')).toBeUndefined();
    expect(parsePopulationValue(',111')).toBeUndefined();
  });

  it('returns undefined if value contains only commas', () => {
    expect(parsePopulationValue(',')).toBeUndefined();
    expect(parsePopulationValue(',,,')).toBeUndefined();
  });

  it('returns correct value if value contains only numbers', () => {
    expect(parsePopulationValue('1')).toBe(1);
    expect(parsePopulationValue('1000')).toBe(1000);
    expect(parsePopulationValue('1000000')).toBe(1000000);
  });

  it('returns correct value if value contains only numbers and commas', () => {
    expect(parsePopulationValue('1,')).toBe(1);
    expect(parsePopulationValue('1000,')).toBe(1000);
    expect(parsePopulationValue('100,000')).toBe(100000);
    expect(parsePopulationValue('1000,000,')).toBe(1000000);
    expect(parsePopulationValue('1000,000,,,')).toBe(1000000);
  });

  it('returns correct value if value has multiple commas', () => {
    expect(parsePopulationValue('1,000,0000')).toBe(10000000);
  });

  it('returns undefined if value is longer than 11 characters (e.g. 100,000,0000)', () => {
    expect(parsePopulationValue('100,000,0000')).toBeUndefined();
  });

  it('returns undefined if value evaluates to 0', () => {
    expect(parsePopulationValue('0')).toBeUndefined();
    expect(parsePopulationValue('0,')).toBeUndefined();
  });
});
