import { defineMessages } from 'react-intl';

export default defineMessages({
  noResults: {
    id: 'app.containers.Admin.communityMonitor.noResults',
    defaultMessage: 'No results for this period.',
  },
  quarterChartLabel: {
    id: 'app.containers.Admin.communityMonitor.quarterChartLabel',
    defaultMessage: 'Q{quarter} {year}',
  },
  healthScore: {
    id: 'app.containers.Admin.communityMonitor.healthScore',
    defaultMessage: 'Health Score',
  },
  lastQuarter: {
    id: 'app.containers.Admin.communityMonitor.lastQuarter',
    defaultMessage: ' last quarter',
  },
  healthScoreDescription: {
    id: 'app.containers.Admin.communityMonitor.healthScoreDescription',
    defaultMessage:
      'This score is the average of all sentiment-scale questions answered by participants for the period selected.',
  },
  healthScoreTableCaption: {
    id: 'app.containers.Admin.communityMonitor.healthScoreTableCaption',
    defaultMessage:
      'Health Score Table showing the health score for each category per selected period',
  },
  categoryColumn: {
    id: 'app.containers.Admin.communityMonitor.categoryColumn',
    defaultMessage: 'Category',
  },
  overallHealthScore: {
    id: 'app.containers.Admin.communityMonitor.overallHealthScore',
    defaultMessage: 'Overall Health Score',
  },
  quarter: {
    id: 'app.containers.Admin.communityMonitor.quarter',
    defaultMessage: 'Quarter',
  },
});
