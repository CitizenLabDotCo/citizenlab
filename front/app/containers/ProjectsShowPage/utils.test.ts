import { isReady } from './utils';

const project: any = { attributes: { slug: 'test' } };

describe('isReady', () => {
  it('returns false if timeline project and no phases', () => {
    expect(isReady(project, null)).toBe(false);
  });

  it('returns true if timeline project and phases', () => {
    expect(isReady(project, { data: [] })).toBe(true);
  });
});
