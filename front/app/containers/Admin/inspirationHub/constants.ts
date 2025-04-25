import { ParticipationMethod } from 'api/phases/types';
import { PopulationGroup } from 'api/project_library_projects/types';

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
  community_monitor_survey: messages.communityMonitorSurvey,
};

const f = (n: number) => n.toLocaleString();

export const POPULATION_GROUP_LABELS: Record<PopulationGroup, string> = {
  XS: `< ${f(10_000)}`,
  S: `${f(10_000)} - ${f(30_000)}`,
  M: `${f(30_000)} - ${f(100_000)}`,
  L: `${f(100_000)} - ${f(250_000)}`,
  XL: `> ${f(250_000)}`,
};
