import { defineMessages } from 'react-intl';

export default defineMessages({
  visitors: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visitors',
    defaultMessage: 'Visitors',
  },
  visits: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visits',
    defaultMessage: 'Visits',
  },
  visitDuration: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visitDuration',
    defaultMessage: 'Visit duration',
  },
  pageViews: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.pageViews',
    defaultMessage: 'Pageviews per visit ',
  },
  cardTitleTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.cardTitleTooltipMessage2',
    defaultMessage:
      'Only users who have accepted cookie tracking will be counted. Admins and project managers are also counted if they accept cookie tracking.',
  },
  visitorsStatTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visitorsStatTooltipMessage',
    defaultMessage:
      '"Visitors" is the number of unique visitors. If a person visits the platform multiple times, they are only counted once.',
  },
  visitsStatTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visitsStatTooltipMessage',
    defaultMessage:
      '"Visits" is the number of sessions. If a person visited the platform multiple times, each visit is counted.',
  },
});
