import { defineMessages } from 'react-intl';

export default defineMessages({
  quarterYearCondensed: {
    id: 'app.containers.Admin.communityMonitor.quarterYearCondensed',
    defaultMessage: 'Q{quarterNumber} {year}',
  },
  totalSurveyResponses: {
    id: 'app.containers.Admin.communityMonitor.totalSurveyResponses',
    defaultMessage: 'Total survey responses',
  },
  noSurveyResponses: {
    id: 'app.containers.Admin.communityMonitor.noSurveyResponses',
    defaultMessage: 'No survey responses',
  },
  communityMonitorUpsell: {
    id: 'app.containers.Admin.communityMonitor.communityMonitorUpsell',
    defaultMessage:
      'Community Monitor is not currently enabled for your platform. Please contact your Government Success Manager for more information.',
  },
  noModeratorAccessCommunityMonitor: {
    id: 'app.containers.Admin.communityMonitor.noModeratorAccessCommunityMonitor',
    defaultMessage:
      ' You do not have access to the Community Monitor. Please contact your platform administrator if you wish to request access.',
  },
});
