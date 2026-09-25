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

  it.each(['native_survey', 'community_monitor_survey'] as const)(
    'points to the Insights tab for %s phases',
    (participationMethod) => {
      expect(getApproveAllExplanationMessage(participationMethod)).toBe(
        messages.confirmApproveAllExplanationInsights
      );
    }
  );

  it('falls back to the input manager message while the phase is loading', () => {
    expect(getApproveAllExplanationMessage(undefined)).toBe(
      messages.confirmApproveAllExplanation
    );
  });
});
