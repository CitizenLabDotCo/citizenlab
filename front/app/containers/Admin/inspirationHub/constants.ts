import { ParticipationMethod } from 'api/phases/types';
import { Status } from 'api/project_library_projects/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export const STATUS_EMOJIS: Record<Status, string> = {
  active: '🟢',
  finished: '🟠',
  stale: '⚪',
  archived: '🔵',
};

export const STATUS_LABELS: Record<Status, MessageDescriptor> = {
  active: messages.active,
  finished: messages.finished,
  stale: messages.stale,
  archived: messages.archived,
};

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
