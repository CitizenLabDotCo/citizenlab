import { defineMessages } from 'react-intl';

export default defineMessages({
  visitorDataBanner: {
    id: 'app.modules.commercial.analytics.admin.containers.visitors.visitorDataBanner',
    defaultMessage:
      'We have changed the way we collect and display visitor data. As a result, visitor data is more accurate and more types of data are available, while still being GDPR compliant. While the data used for the visitors timeline goes back longer, we only started collecting the data for the "Visit duration", "Pageviews per visit" and the other graphs in November 2024, so before that no data is available. Therefore, if you select data before November 2024, be aware that some graphs might be empty or look odd.',
  },
  noData: {
    id: 'app.modules.commercial.analytics.admin.containers.visitors.noData',
    defaultMessage: 'There is no visitor data yet.',
  },
});
