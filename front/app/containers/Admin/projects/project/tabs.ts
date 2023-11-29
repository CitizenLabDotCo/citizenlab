import { ITab, FormatMessage } from 'typings';
import messages from './messages';

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
      label: formatMessage(messages.phaseAccessRights),
      url: 'access-rights',
      name: 'access-rights',
    },
  ];
};
