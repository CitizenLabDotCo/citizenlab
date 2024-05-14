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
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.cardTitleTooltipMessage3',
    defaultMessage:
      'Participants are users or visitors that have participated in a project, posted or interacted with a proposal, attended events or followed things.',
  },
  participationRate: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.participationRate',
    defaultMessage: 'Participation rate',
  },
  participationRateTooltip: {
    id: 'app.modules.commercial.analytics.admin.components.ActiveUsersCard.participationRateTooltip2',
    defaultMessage:
      'Percentage of all participants compared to all visitors. Only participants and visitors that accepted cookies are counted.',
  },
});
