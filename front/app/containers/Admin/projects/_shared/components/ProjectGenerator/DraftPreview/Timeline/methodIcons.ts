import { IconNames } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

export const METHOD_ICONS: Record<ParticipationMethod, IconNames> = {
  ideation: 'idea',
  proposals: 'proposals',
  native_survey: 'survey',
  community_monitor_survey: 'survey',
  survey: 'survey',
  information: 'info-outline',
  voting: 'vote-ballot',
  poll: 'survey-single-choice',
  volunteering: 'volunteer',
  common_ground: 'community',
  document_annotation: 'file',
};
