import { FormatMessage, IOption } from 'typings';

import { ProjectSortableParam } from 'api/projects_mini_admin/types';

import projectFilterMessages from 'containers/Admin/projects/all/new/_shared/FilterBar/Filters/messages';

import messages from '../messages';

export const getPublicationStatusOptions = (
  formatMessage: FormatMessage
): IOption[] => [
  { value: 'published', label: formatMessage(messages.published) },
  { value: 'archived', label: formatMessage(messages.archived) },
];

export const getBooleanOptions = (formatMessage: FormatMessage): IOption[] => [
  { value: 'true', label: formatMessage(messages.yes) },
  { value: 'false', label: formatMessage(messages.no) },
];

export const getParticipationStateOptions = (
  formatMessage: FormatMessage
): IOption[] => [
  {
    value: 'not_started',
    label: formatMessage(projectFilterMessages.notStarted),
  },
  {
    value: 'collecting_data',
    label: formatMessage(projectFilterMessages.collectingData),
  },
  {
    value: 'informing',
    label: formatMessage(projectFilterMessages.informing),
  },
  { value: 'past', label: formatMessage(projectFilterMessages.past) },
];

export const getVisibilityOptions = (
  formatMessage: FormatMessage
): IOption[] => [
  {
    value: 'public',
    label: formatMessage(projectFilterMessages.visibilityPublic),
  },
  {
    value: 'groups',
    label: formatMessage(projectFilterMessages.visibilityGroups),
  },
  {
    value: 'admins',
    label: formatMessage(projectFilterMessages.visibilityAdmins),
  },
];

export const getDiscoverabilityOptions = (
  formatMessage: FormatMessage
): IOption[] => [
  { value: 'listed', label: formatMessage(messages.listed) },
  { value: 'unlisted', label: formatMessage(messages.unlisted) },
];

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
  {
    value: 'alphabetically_asc',
    label: formatMessage(projectFilterMessages.alphabetically_asc),
  },
  {
    value: 'alphabetically_desc',
    label: formatMessage(projectFilterMessages.alphabetically_desc),
  },
];
