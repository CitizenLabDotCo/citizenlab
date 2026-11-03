import messages from './messages';
import { getApproveAllExplanationMessage } from './utils';

describe('getApproveAllExplanationMessage', () => {
  it.each(['ideation', 'proposals', 'voting'] as const)(
    'points to the input manager for %s phases',
    (participationMethod) => {
      expect(getApproveAllExplanationMessage(participationMethod)).toBe(
        messages.confirmApproveAllExplanation
      );
    }
  );

  it('points to the Insights tab for native_survey phases', () => {
    expect(getApproveAllExplanationMessage('native_survey')).toBe(
      messages.confirmApproveAllExplanationInsights
    );
  });

  it('points to the Live monitor for community_monitor_survey phases', () => {
    expect(getApproveAllExplanationMessage('community_monitor_survey')).toBe(
      messages.confirmApproveAllExplanationCommunityMonitor
    );
  });

  it('falls back to the input manager message while the phase is loading', () => {
    expect(getApproveAllExplanationMessage(undefined)).toBe(
      messages.confirmApproveAllExplanation
    );
  });
});
