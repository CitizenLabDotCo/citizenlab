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
});
