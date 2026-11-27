import { IPhasePermissionAction } from 'api/permissions/types';

import messages from './messages';

// The short name of an action, for the segmented tabs.
const shortActionLabel = (action: IPhasePermissionAction) => {
  switch (action) {
    case 'posting_idea':
      return messages.submitting;
    case 'commenting_idea':
      return messages.commenting;
    case 'reacting_idea':
      return messages.reacting;
    case 'attending_event':
      return messages.attendingEvents;
    case 'voting':
      return messages.voting;
    case 'volunteering':
      return messages.volunteering;
    case 'taking_survey':
      return messages.takingSurveyAction;
    case 'taking_poll':
      return messages.takingPollAction;
    case 'annotating_document':
      return messages.annotating;
  }
};

export default shortActionLabel;
