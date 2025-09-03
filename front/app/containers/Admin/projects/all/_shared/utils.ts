import { colors } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';
import { PublicationStatus } from 'api/projects/types';

export const getStatusColor = (status: PublicationStatus) => {
  switch (status) {
    case 'published':
      return colors.green500;
    case 'draft':
      return colors.orange500;
    case 'archived':
      return colors.background;
  }
};

const SURVEY_VALUES: ParticipationMethod[] = ['survey', 'native_survey'];

// If people select 'survey', we want to include both 'survey' and 'native_survey'
export const getParticipationMethods = (
  participation_methods?: ParticipationMethod[]
) => {
  if (!participation_methods) return undefined;

  if (participation_methods.includes('survey')) {
    return [
      ...participation_methods.filter(
        (method) => !SURVEY_VALUES.includes(method)
      ),
      ...SURVEY_VALUES,
    ];
  }
  return participation_methods;
};
