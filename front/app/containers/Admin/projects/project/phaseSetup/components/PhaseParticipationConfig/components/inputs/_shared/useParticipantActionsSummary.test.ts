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

  it('shows the configured Common Ground and voting actions', () => {
    const commonGround = renderHook(() =>
      useParticipantActionsSummary({ adding_statements: true, voting: true })
    );
    const voting = renderHook(() =>
      useParticipantActionsSummary({ voting: true, commenting_enabled: false })
    );

    expect(commonGround.result.current).toBe('Add statements +1');
    expect(voting.result.current).toBe('Vote');
  });

  it('has no summary when every action is off', () => {
    const { result } = renderHook(() => useParticipantActionsSummary({}));

    expect(result.current).toBeUndefined();
  });
});
