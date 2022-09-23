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
  last30Days: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.last30Days',
    defaultMessage: 'Last 30 days:',
  },
  last7Days: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.last7Days',
    defaultMessage: 'Last 7 days:',
  },
  yesterday: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.yesterday',
    defaultMessage: 'Yesterday:',
  },
  titleTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.titleTooltipMessage',
    defaultMessage:
      'Visits of admins and project managers are not counted here.',
  },
  emptyTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.emptyTooltipMessage',
    defaultMessage: 'Data is not available when the project filter is active.',
  },
  visitorsTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visitorsTooltipMessage',
    defaultMessage: '"Visitors" is the number of unique visitors. If the same person visited the platform multiple times, they are counted once.',
  },
  visitsTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.visitsTooltipMessage',
    defaultMessage: '"Visits" is the number of sessions. If the same person visited the platform multiple times, each visit is counted.',
  }
});
