import { ITab, FormatMessage } from 'typings';
import messages from './messages';

export const getIntialTabs = (
  formatMessage: FormatMessage,
  phaseId?: string
): ITab[] => {
  if (!phaseId) {
    return [];
  }
  return [
    {
      label: formatMessage(messages.setup),
      url: `setup/${phaseId}`,
      name: 'setup',
    },
    {
      label: formatMessage(messages.inputManagerTab),
      url: `ideas/${phaseId}`,
      name: 'ideas',
    },
    {
      label: formatMessage(messages.inputFormTab),
      url: `ideaform/${phaseId}`,
      name: 'ideaform',
    },
    {
      label: formatMessage(messages.pollTab),
      url: `poll/${phaseId}`,
      feature: 'polls',
      name: 'poll',
    },
    {
      label: formatMessage(messages.surveyTab),
      url: `native-survey/${phaseId}`,
      name: 'survey',
      active: (url: string) => url.endsWith('native-survey'),
    },
    {
      label: formatMessage(messages.surveyResultsTab),
      url: `survey-results/${phaseId}`,
      name: 'survey-results',
    },
    {
      label: formatMessage(messages.volunteeringTab),
      url: `volunteering/${phaseId}`,
      feature: 'volunteering',
      name: 'volunteering',
    },
  ];
};
