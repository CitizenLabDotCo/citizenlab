import { IPhaseData } from 'api/phases/types';

export function getTimelineTab(
  phase: IPhaseData
):
  | 'setup'
  | 'ideas'
  | 'proposals'
  | 'insights'
  | 'polls'
  | 'survey-results'
  | 'volunteering' {
  const participationMethod = phase.attributes.participation_method;

  if (participationMethod === 'ideation' || participationMethod === 'voting') {
    return 'ideas';
  } else if (participationMethod === 'proposals') {
    return 'proposals';
  } else if (participationMethod === 'native_survey') {
    return 'insights';
  } else if (participationMethod === 'poll') {
    return 'polls';
  } else if (participationMethod === 'survey') {
    return 'survey-results';
  } else if (participationMethod === 'volunteering') {
    return 'volunteering';
  }

  return 'setup';
}
