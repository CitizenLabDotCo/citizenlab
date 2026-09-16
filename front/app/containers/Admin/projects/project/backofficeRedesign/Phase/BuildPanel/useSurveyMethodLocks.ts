import { IPhaseData } from 'api/phases/types';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

import {
  SURVEY_METHODS,
  SurveyMethod,
} from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

// The backend refuses to change the method of a phase that has responses or
// poll questions, so those switches are locked up front.
const useSurveyMethodLocks = (
  phase: IPhaseData
): Partial<Record<SurveyMethod, string>> => {
  const { formatMessage } = useIntl();
  const { data: pollQuestions } = usePollQuestions({ phaseId: phase.id });
  const method = phase.attributes.participation_method;

  const reason =
    method === 'poll' && pollQuestions && pollQuestions.data.length > 0
      ? formatMessage(messages.switchLockedPollQuestions)
      : method !== 'poll' && phase.attributes.ideas_count > 0
      ? formatMessage(messages.switchLockedResponses)
      : undefined;

  if (!reason) return {};

  return Object.fromEntries(
    SURVEY_METHODS.filter((other) => other !== method).map((other) => [
      other,
      reason,
    ])
  );
};

export default useSurveyMethodLocks;
