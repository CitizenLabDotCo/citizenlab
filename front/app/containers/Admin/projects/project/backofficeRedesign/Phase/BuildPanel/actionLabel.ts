import { IPhasePermissionAction } from 'api/permissions/types';

import projectMessages from 'containers/Admin/projects/project/messages';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';

import messages from '../../messages';

/** A short name for what participants do, used as a tab label. */
const actionLabel = (action: IPhasePermissionAction) => {
  switch (action) {
    case 'posting_idea':
      return projectMessages.inputPostingEnabled;
    case 'commenting_idea':
      return projectMessages.inputCommentingEnabled;
    case 'reacting_idea':
      return projectMessages.inputReactingEnabled;
    case 'attending_event':
      return projectMessages.attendingEventAction;
    case 'voting':
      return configMessages.votingOnInputsAction;
    case 'volunteering':
      return configMessages.volunteeringAction;
    case 'taking_survey':
      return messages.takingSurveyAction;
    case 'taking_poll':
      return messages.takingPollAction;
    case 'annotating_document':
      return messages.annotatingDocumentAction;
  }
};

export default actionLabel;
