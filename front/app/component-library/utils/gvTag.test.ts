import { gvTag } from './gvTag';

describe('gvTag', () => {
  const original = process.env.VITE_GV_DESIGN_TAGS;
  afterEach(() => {
    if (original === undefined) delete process.env.VITE_GV_DESIGN_TAGS;
    else process.env.VITE_GV_DESIGN_TAGS = original;
  });

  it('returns an empty object when the flag is unset', () => {
    delete process.env.VITE_GV_DESIGN_TAGS;
    expect(gvTag('Button')).toEqual({});
  });

  it('returns an empty object when the flag is empty or not 1', () => {
    process.env.VITE_GV_DESIGN_TAGS = '';
    expect(gvTag('Button')).toEqual({});
    process.env.VITE_GV_DESIGN_TAGS = '0';
    expect(gvTag('Button')).toEqual({});
  });

  it('returns the data attribute when the flag is 1', () => {
    process.env.VITE_GV_DESIGN_TAGS = '1';
    expect(gvTag('Button')).toEqual({ 'data-gv-component': 'Button' });
  });
});
