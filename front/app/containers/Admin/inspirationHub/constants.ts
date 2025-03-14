import { ParticipationMethod } from 'api/phases/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export const PARTICIPATION_METHOD_LABELS: Record<
  ParticipationMethod,
  MessageDescriptor
> = {
  ideation: messages.ideation,
  information: messages.information,
  native_survey: messages.survey,
  survey: messages.externalSurvey,
  voting: messages.voting,
  poll: messages.poll,
  volunteering: messages.volunteering,
  document_annotation: messages.documentAnnotation,
  proposals: messages.proposals,
};
