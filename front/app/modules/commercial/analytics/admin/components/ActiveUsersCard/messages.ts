import { defineMessages } from 'react-intl';

export default defineMessages({
  activeUsers: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.activeUsers',
    defaultMessage: 'Active users',
  },
  totalActiveUsers: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.totalActiveUsers',
    defaultMessage: 'Total active users',
  },
  cardTitleTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.cardTitleTooltipMessage',
    defaultMessage:
      'The number of users who have participated in one or more project(s). Participants for polling and embedded surveys will not be counted here.',
  },
  participationRate: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.participationRate',
    defaultMessage: 'Participation rate',
  },
  participationRateTooltip: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.participationRateTooltip',
    defaultMessage: 'Percentage of all participants compared to all visitors.',
  },
});
