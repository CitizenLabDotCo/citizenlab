import { ITab, FormatMessage } from 'typings';

import { IPhaseData } from 'api/phases/types';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from './messages';

export type IPhaseTab = ITab & {
  disabledTooltipText?: string;
};

export type FeatureFlags = {
  surveys_enabled: boolean;
  typeform_enabled: boolean;
  report_builder_enabled: boolean;
};

export const getTabs = (
  phase: IPhaseData,
  { surveys_enabled, typeform_enabled, report_builder_enabled }: FeatureFlags,
  formatMessage: FormatMessage
): IPhaseTab[] => {
  return [
    {
      label: formatMessage(messages.setup),
      url: 'setup',
      name: 'setup',
    },
    getMethodConfig(phase.attributes.participation_method).showInputManager && {
      label: formatMessage(messages.inputManagerTab),
      url: getMethodConfig(phase.attributes.participation_method)
        .inputManagerName,
      name: getMethodConfig(phase.attributes.participation_method)
        .inputManagerName,
    },
    getMethodConfig(phase.attributes.participation_method).formEditor ===
      'simpleFormEditor' && {
      label: formatMessage(messages.inputFormTab),
      url: 'form',
      name: 'form',
    },
    (phase.attributes.participation_method === 'ideation' ||
      phase.attributes.participation_method === 'voting' ||
      phase.attributes.participation_method === 'proposals') && {
      label: formatMessage(messages.mapTab),
      url: 'map',
      name: 'map',
    },
    phase.attributes.participation_method === 'poll' && {
      label: formatMessage(messages.pollTab),
      url: 'polls',
      feature: 'polls',
      name: 'poll',
    },
    ['native_survey', 'community_monitor'].includes(
      phase.attributes.participation_method
    ) && {
      label: formatMessage(messages.surveyTab),
      url: 'native-survey',
      name: 'survey',
    },
    phase.attributes.participation_method === 'survey' &&
      surveys_enabled &&
      typeform_enabled && // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (!surveys_enabled || phase.attributes.survey_service === 'typeform') && {
        label: formatMessage(messages.surveyResultsTab),
        url: 'survey-results',
        name: 'survey-results',
      },
    phase.attributes.participation_method === 'volunteering' && {
      label: formatMessage(messages.volunteeringTab),
      url: 'volunteering',
      name: 'volunteering',
    },
    phase.attributes.participation_method === 'information' && {
      label: formatMessage(messages.reportTab),
      url: 'report',
      name: 'report',
      disabledTooltipText: report_builder_enabled
        ? undefined
        : formatMessage(messages.lockedTooltip),
    },
    {
      label: formatMessage(messages.phaseAccessRights),
      url: 'access-rights',
      name: 'access-rights',
    },
  ].filter((tab) => typeof tab === 'object') as IPhaseTab[];
};
