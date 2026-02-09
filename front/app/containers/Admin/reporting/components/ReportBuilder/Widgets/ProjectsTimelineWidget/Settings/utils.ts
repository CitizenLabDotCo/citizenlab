import { FormatMessage, IOption } from 'typings';

import { ProjectSortableParam } from 'api/projects_mini_admin/types';

import projectFilterMessages from 'containers/Admin/projects/all/_shared/FilterBar/Filters/messages';

export const getParticipationMethodOptions = (
  formatMessage: FormatMessage
): IOption[] => [
  {
    value: 'ideation',
    label: formatMessage(projectFilterMessages.participationMethodIdeation),
  },
  {
    value: 'voting',
    label: formatMessage(projectFilterMessages.participationMethodVoting),
  },
  {
    value: 'information',
    label: formatMessage(projectFilterMessages.participationMethodInformation),
  },
  {
    value: 'survey',
    label: formatMessage(projectFilterMessages.participationMethodSurvey),
  },
  {
    value: 'poll',
    label: formatMessage(projectFilterMessages.participationMethodPoll),
  },
  {
    value: 'document_annotation',
    label: formatMessage(projectFilterMessages.pMDocumentAnnotation),
  },
  {
    value: 'volunteering',
    label: formatMessage(projectFilterMessages.participationMethodVolunteering),
  },
  {
    value: 'proposals',
    label: formatMessage(projectFilterMessages.participationMethodProposals),
  },
  {
    value: 'common_ground',
    label: formatMessage(
      projectFilterMessages.participationMethodDocumentCommonGround
    ),
  },
];

export interface ISortOption<T> {
  value: T;
  label: string;
}

export const getSortOptions = (
  formatMessage: FormatMessage
): ISortOption<ProjectSortableParam>[] => [
  {
    value: 'alphabetically_asc',
    label: formatMessage(projectFilterMessages.alphabetically_asc),
  },
  {
    value: 'alphabetically_desc',
    label: formatMessage(projectFilterMessages.alphabetically_desc),
  },
  {
    value: 'participation_asc',
    label: formatMessage(projectFilterMessages.participation_asc),
  },
  {
    value: 'participation_desc',
    label: formatMessage(projectFilterMessages.participation_desc),
  },
  {
    value: 'phase_starting_or_ending_soon',
    label: formatMessage(projectFilterMessages.phase_starting_or_ending_soon),
  },
  {
    value: 'recently_viewed',
    label: formatMessage(projectFilterMessages.recently_viewed),
  },
  {
    value: 'recently_created_asc',
    label: formatMessage(projectFilterMessages.recently_created_asc),
  },
  {
    value: 'recently_created_desc',
    label: formatMessage(projectFilterMessages.recently_created_desc),
  },
];
