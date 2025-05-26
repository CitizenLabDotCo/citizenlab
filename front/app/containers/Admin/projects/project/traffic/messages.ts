import { defineMessages } from 'react-intl';

export default defineMessages({
  visitorsTimeline: {
    id: 'app.containers.Admin.projects.project.traffic.visitorsTimeline',
    defaultMessage: 'Visitors timeline',
  },
  trafficSources: {
    id: 'app.containers.Admin.projects.project.traffic.trafficSources',
    defaultMessage: 'Traffic sources',
  },
  selectPeriod: {
    id: 'app.containers.Admin.projects.project.traffic.selectPeriod',
    defaultMessage: 'Select period',
  },
  visitorDataBanner: {
    id: 'app.containers.Admin.projects.project.traffic.visitorDataBanner',
    defaultMessage:
      'We have changed the way we collect and display traffic data. As a result, traffic data is more accurate and more types of data are available, while still being GDPR compliant. We only started collecting this new data in November 2024, so before that no data is available.',
  },
});
