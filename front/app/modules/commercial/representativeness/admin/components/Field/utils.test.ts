import { parsePopulationValue } from './utils';

describe('parsePopulationValue', () => {
  it('returns empty string if value is emtpy string', () => {
    expect(parsePopulationValue('').formattedValue).toBe('');
  });

  it('returns null if value contains anything other than numbers or commas', () => {
    expect(parsePopulationValue('a').formattedValue).toBeNull();
    expect(parsePopulationValue('1a').formattedValue).toBeNull();
    expect(parsePopulationValue('1,a').formattedValue).toBeNull();
    expect(parsePopulationValue('-1,000').formattedValue).toBeNull();
    expect(parsePopulationValue('%,000').formattedValue).toBeNull();
  });

  it('returns null if value starts with comma', () => {
    expect(parsePopulationValue(',1').formattedValue).toBeNull();
    expect(parsePopulationValue(',111').formattedValue).toBeNull();
  });

  it('returns null if value contains only commas', () => {
    expect(parsePopulationValue(',').formattedValue).toBeNull();
    expect(parsePopulationValue(',,,').formattedValue).toBeNull();
  });

  it('returns correct string if value contains only numbers', () => {
    expect(parsePopulationValue('1').formattedValue).toBe('1');
    expect(parsePopulationValue('1000').formattedValue).toBe('1,000');
    expect(parsePopulationValue('1000000').formattedValue).toBe('1,000,000');
  });

  it('returns correct string if value contains only numbers and commas', () => {
    expect(parsePopulationValue('1,').formattedValue).toBe('1');
    expect(parsePopulationValue('1000,').formattedValue).toBe('1,000');
    expect(parsePopulationValue('1000,000,').formattedValue).toBe('1,000,000');
    expect(parsePopulationValue('1000,000,,,').formattedValue).toBe(
      '1,000,000'
    );
  });

  it('returns correct string if value has multiple commas', () => {
    expect(parsePopulationValue('1,000,0000').formattedValue).toBe(
      '10,000,000'
    );
  });

  it('returns null if value is longer than 11 characters (e.g. 100,000,0000', () => {
    expect(parsePopulationValue('100,000,0000').formattedValue).toBeNull();
  });
});
