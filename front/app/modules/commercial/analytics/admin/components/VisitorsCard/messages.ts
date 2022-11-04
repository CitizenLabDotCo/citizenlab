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
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.cardTitleTooltipMessage',
    defaultMessage:
      'Only users who have accepted cookie tracking will be counted. Admins and project managers are not counted.',
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
  durationStatTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.durationStatTooltipMessage',
    defaultMessage:
      'When the project filter is active, this shows the average duration of any visit that included the selected project. This counts the entire period a user was on the platform, not just the time spent on the selected project page(s).',
  },
  pageViewsStatTooltipMessage: {
    id: 'app.modules.commercial.analytics.admin.components.VisitorsCard.pageViewsStatTooltipMessage',
    defaultMessage:
      'When the project filter is active, this shows the average page views for any visit that included the selected project. This counts all pages that a user viewed during the visit, not just the selected project page(s).',
  },
});
