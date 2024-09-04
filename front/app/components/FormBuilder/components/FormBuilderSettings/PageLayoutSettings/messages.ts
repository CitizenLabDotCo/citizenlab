import { defineMessages } from 'react-intl';

export default defineMessages({
  mapOptionDescription: {
    id: 'app.components.formBuilder.formBuilderSettings.pageLayoutSettings.mapOptionDescription',
    defaultMessage:
      'Embed map as context or ask location based questions to participants.',
  },
  mapBasedPage: {
    id: 'app.components.formBuilder.formBuilderSettings.pageLayoutSettings.mapBasedPage',
    defaultMessage: 'Map-based page',
  },
  normalPage: {
    id: 'app.components.formBuilder.formBuilderSettings.pageLayoutSettings.normalPage',
    defaultMessage: 'Normal page',
  },
  pageType: {
    id: 'app.components.formBuilder.formBuilderSettings.pageLayoutSettings.pageType',
    defaultMessage: 'Page type',
  },
  notInCurrentLicense: {
    id: 'app.components.formBuilder.formBuilderSettings.pageLayoutSettings.notInCurrentLicense',
    defaultMessage:
      'Survey mapping features are not included in your current license. Reach out to your GovSuccess Manager to learn more.',
  },
  noMapInputQuestions: {
    id: 'app.components.formBuilder.formBuilderSettings.pageLayoutSettings.noMapInputQuestions',
    defaultMessage:
      'For optimal user experience, we do not recommend adding point, route, or area questions to map-based pages.',
  },
});
