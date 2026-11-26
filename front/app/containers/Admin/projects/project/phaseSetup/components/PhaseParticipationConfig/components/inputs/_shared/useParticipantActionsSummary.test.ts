import { renderHook } from 'utils/testUtils/rtl';

import useParticipantActionsSummary from './useParticipantActionsSummary';

describe('useParticipantActionsSummary', () => {
  it('names the first action that is on and counts the rest', () => {
    const { result } = renderHook(() =>
      useParticipantActionsSummary({
        submission_enabled: true,
        commenting_enabled: true,
        reacting_enabled: true,
      })
    );

    expect(result.current).toBe('Submit +2');
  });

  it('skips actions that are off', () => {
    const { result } = renderHook(() =>
      useParticipantActionsSummary({
        submission_enabled: false,
        commenting_enabled: true,
        reacting_enabled: false,
      })
    );

    expect(result.current).toBe('Comment');
  });

  it('has no summary when every action is off', () => {
    const { result } = renderHook(() => useParticipantActionsSummary({}));

    expect(result.current).toBeUndefined();
  });
});
