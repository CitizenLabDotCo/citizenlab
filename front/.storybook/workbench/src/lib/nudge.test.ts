import { nudgeValue, stepNumber, stepOfKey } from './nudge';

describe('stepOfKey', () => {
  it('steps by 1, or 10 with Shift, and ignores other keys', () => {
    expect(stepOfKey({ key: 'ArrowUp', shiftKey: false })).toBe(1);
    expect(stepOfKey({ key: 'ArrowDown', shiftKey: false })).toBe(-1);
    expect(stepOfKey({ key: 'ArrowUp', shiftKey: true })).toBe(10);
    expect(stepOfKey({ key: 'ArrowDown', shiftKey: true })).toBe(-10);
    expect(stepOfKey({ key: 'ArrowLeft', shiftKey: false })).toBe(0);
  });
});

describe('stepNumber', () => {
  it('drops float noise and clamps at the floor', () => {
    expect(stepNumber(0.1, 0.2)).toBe(0.3);
    expect(stepNumber(1.5, 1)).toBe(2.5);
    expect(stepNumber(3, -10, 0)).toBe(0);
    expect(stepNumber(3, -10)).toBe(-7);
  });
});

describe('nudgeValue', () => {
  it('keeps the unit of a single value', () => {
    expect(nudgeValue('3px', 1)?.value).toBe('4px');
    expect(nudgeValue('0.25rem', 1)?.value).toBe('1.25rem');
    expect(nudgeValue('150ms', -10)?.value).toBe('140ms');
    expect(nudgeValue('1.5', 1)?.value).toBe('2.5');
    expect(nudgeValue('400', 10)?.value).toBe('410');
  });

  it('clamps where negatives make no sense', () => {
    expect(nudgeValue('4px', -10, { min: 0 })?.value).toBe('0px');
    expect(nudgeValue('-0.5px', -1)?.value).toBe('-1.5px');
  });

  it('moves the number at the caret of a composite value', () => {
    const shadow = '0px 2px 4px -1px rgba(0,0,0,0.06)';
    expect(nudgeValue(shadow, 1)?.value).toBe(
      '1px 2px 4px -1px rgba(0,0,0,0.06)'
    );
    const blur = shadow.indexOf('4px') + 1;
    expect(nudgeValue(shadow, 1, { caret: blur })).toEqual({
      value: '0px 2px 5px -1px rgba(0,0,0,0.06)',
      start: 8,
      end: 11,
    });
    expect(nudgeValue('2px solid #000000', 1)?.value).toBe('3px solid #000000');
  });

  it('clamps by the number of a layer and gives bare 0 a unit', () => {
    const opts = { min: (i: number) => (i === 2 ? 0 : undefined), unit: 'px' };
    expect(
      nudgeValue('0 0 0 3px red, 0 1px 0px 0 blue', -1, {
        ...opts,
        caret: 23,
      })?.value
    ).toBe('0 0 0 3px red, 0 1px 0px 0 blue');
    expect(nudgeValue('0 0 0 3px #fff', 1, opts)?.value).toBe(
      '1px 0 0 3px #fff'
    );
  });

  it('leaves numbers inside functions and colours alone', () => {
    expect(nudgeValue('rgba(0,0,0,0.5)', 1)).toBeNull();
    expect(nudgeValue('#ff0000', 1)).toBeNull();
    expect(nudgeValue('var(--gv-space-2)', 1)).toBeNull();
    expect(nudgeValue('auto', 1)).toBeNull();
  });
});
