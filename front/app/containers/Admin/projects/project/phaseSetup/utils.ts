import { IPhaseData } from 'api/phases/types';

export function getTimelineTab(
  phase: IPhaseData,
  phaseInsightsEnabled = true
):
  | 'setup'
  | 'ideas'
  | 'proposals'
  | 'insights'
  | 'results'
  | 'polls'
  | 'survey-results'
  | 'volunteering' {
  const participationMethod = phase.attributes.participation_method;

  if (participationMethod === 'ideation' || participationMethod === 'voting') {
    return 'ideas';
  } else if (participationMethod === 'proposals') {
    return 'proposals';
  } else if (participationMethod === 'native_survey') {
    // When phase_insights is disabled, redirect to old 'results' tab
    return phaseInsightsEnabled ? 'insights' : 'results';
  } else if (participationMethod === 'poll') {
    return 'polls';
  } else if (participationMethod === 'survey') {
    return 'survey-results';
  } else if (participationMethod === 'volunteering') {
    return 'volunteering';
  }

  return 'setup';
}
