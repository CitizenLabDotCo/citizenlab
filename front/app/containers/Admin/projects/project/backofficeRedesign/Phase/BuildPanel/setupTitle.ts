import { ParticipationMethod } from 'api/phases/types';

import messages from '../../messages';

const setupTitle = (participationMethod: ParticipationMethod) => {
  switch (participationMethod) {
    case 'ideation':
      return messages.ideationSetup;
    case 'proposals':
      return messages.proposalsSetup;
    case 'voting':
      return messages.votingSetup;
    case 'information':
      return messages.informationSetup;
    case 'common_ground':
      return messages.commonGroundSetup;
    case 'volunteering':
      return messages.volunteeringSetup;
    case 'document_annotation':
      return messages.documentAnnotationSetup;
    case 'native_survey':
    case 'community_monitor_survey':
    case 'survey':
    case 'poll':
      return messages.surveySetup;
  }
};

export default setupTitle;
