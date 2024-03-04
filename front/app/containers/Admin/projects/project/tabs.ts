import messages from './messages';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { IPhaseData } from 'api/phases/types';
import { ITab, FormatMessage } from 'typings';

type TabHideConditions = {
  [tabName: string]: () => boolean;
};

export const getIntialTabs = (formatMessage: FormatMessage): ITab[] => {
  return [
    {
      label: formatMessage(messages.setup),
      url: 'setup',
      name: 'setup',
    },
    {
      label: formatMessage(messages.inputManagerTab),
      url: 'ideas',
      name: 'ideas',
    },
    {
      label: formatMessage(messages.inputFormTab),
      url: 'ideaform',
      name: 'ideaform',
    },
    {
      label: formatMessage(messages.mapTab),
      url: 'map',
      name: 'map',
    },
    {
      label: formatMessage(messages.pollTab),
      url: 'polls',
      feature: 'polls',
      name: 'poll',
    },
    {
      label: formatMessage(messages.surveyTab),
      url: 'native-survey',
      name: 'survey',
      active: (url: string) => url.endsWith('native-survey'),
    },
    {
      label: formatMessage(messages.surveyResultsTab),
      url: 'survey-results',
      name: 'survey-results',
    },
    {
      label: formatMessage(messages.volunteeringTab),
      url: 'volunteering',
      feature: 'volunteering',
      name: 'volunteering',
    },
    {
      label: formatMessage(messages.report),
      url: 'report',
      name: 'report',
    },
    {
      label: formatMessage(messages.phaseAccessRights),
      url: 'access-rights',
      name: 'access-rights',
    },
  ];
};

type FeatureFlags = {
  surveys_enabled: boolean;
  typeform_enabled: boolean;
  granular_permissions_enabled: boolean;
  phase_reports_enabled: boolean;
};

export const getTabHideConditions = (
  phase: IPhaseData,
  {
    surveys_enabled,
    typeform_enabled,
    granular_permissions_enabled,
    phase_reports_enabled,
  }: FeatureFlags
): TabHideConditions => ({
  ideas: function isIdeaTabHidden() {
    return !getMethodConfig(phase.attributes.participation_method)
      .showInputManager;
  },
  ideaform: function isIdeaFormTabHidden() {
    return (
      getMethodConfig(phase.attributes.participation_method).formEditor !==
      'simpleFormEditor'
    );
  },
  map: function isMapHidden() {
    return !(
      phase.attributes.participation_method === 'ideation' ||
      phase.attributes.participation_method === 'voting'
    );
  },
  poll: function isPollTabHidden() {
    return phase.attributes.participation_method !== 'poll';
  },
  survey: function isSurveyTabHidden() {
    return phase.attributes.participation_method !== 'native_survey';
  },
  'survey-results': function surveyResultsTabHidden() {
    return (
      phase.attributes.participation_method !== 'survey' ||
      !surveys_enabled ||
      !typeform_enabled ||
      (surveys_enabled && phase.attributes.survey_service !== 'typeform')
    );
  },
  volunteering: function isVolunteeringTabHidden() {
    return phase?.attributes.participation_method !== 'volunteering';
  },
  'access-rights': function isAccessRightsTabHidden() {
    return !granular_permissions_enabled;
  },
  report: function isReportTabHidden() {
    return (
      phase?.attributes.participation_method !== 'information' ||
      !phase_reports_enabled
    );
  },
});
