import { defineMessages } from 'react-intl';

export default defineMessages({
  participants: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.participants',
    defaultMessage: 'Participants',
  },
  totalParticipants: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.totalParticipants',
    defaultMessage: 'Total participants',
  },
  cardTitleTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.cardTitleTooltipMessage',
    defaultMessage:
      'The number of users who have participated in one or more project(s). Participants embedded surveys will not be counted here.',
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
