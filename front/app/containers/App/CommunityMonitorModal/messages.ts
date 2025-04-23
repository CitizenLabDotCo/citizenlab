import { defineMessages } from 'react-intl';

export default defineMessages({
  xMinutesToComplete: {
    id: 'app.components.CommunityMonitorModal.xMinutesToComplete',
    defaultMessage:
      '{minutes, plural, =0 {Takes <1 minute} one {Takes 1 minute} other {Takes # minutes}}',
  },
  surveyDescription: {
    id: 'app.components.CommunityMonitorModal.surveyDescription2',
    defaultMessage:
      'This ongoing survey tracks how you feel about governance and public services.',
  },
  formError: {
    id: 'app.components.CommunityMonitorModal.formError',
    defaultMessage: 'Encountered an error.',
  },
});
