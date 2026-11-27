import { InputTerm, ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import inputTermMessages from 'containers/Admin/projects/project/inputTermMessages';

import { useIntl } from 'utils/cl-intl';

import messages from './phaseActionMessages';

interface Options {
  phaseId?: string;
  // An unsaved phase, or a term the admin is still changing, overrides the saved phase.
  participationMethod?: ParticipationMethod;
  inputTerm?: InputTerm | null;
}

/** The plural of what participants post in a phase, for action labels. */
const useInputsNoun = ({ phaseId, participationMethod, inputTerm }: Options) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const method = participationMethod ?? phase?.data.attributes.participation_method;

  if (method === 'common_ground') return formatMessage(messages.statements);

  // Voting has no naming option; its views call the inputs options too.
  const term =
    method === 'voting'
      ? 'option'
      : inputTerm ?? phase?.data.attributes.input_term ?? 'other';
  return formatMessage(inputTermMessages.plural, { term });
};

export default useInputsNoun;
