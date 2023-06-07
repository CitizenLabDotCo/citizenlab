import { isReady } from './utils';

const continuousProject: any = { attributes: { process_type: 'continuous' } };
const timelineProject: any = { attributes: { process_type: 'timeline' } };

describe('isReady', () => {
  it('returns true if continuous project', () => {
    expect(isReady(continuousProject, null)).toBe(true);
  });

  it('returns false if timeline project and no phases', () => {
    expect(isReady(timelineProject, null)).toBe(false);
  });

  it('returns true if timeline project and phases', () => {
    expect(isReady(timelineProject, { data: [] })).toBe(true);
  });
});
