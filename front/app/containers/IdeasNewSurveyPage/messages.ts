import { defineMessages } from 'react-intl';

export default defineMessages({
  surveyNewMetaTitle: {
    id: 'app.containers.IdeasNewPage.surveyNewMetaTitle2',
    defaultMessage: '{surveyTitle} | {orgName}',
  },
  surveySubmittedTitle: {
    id: 'app.containers.IdeasNewPage.SurveySubmittedNotice.surveySubmittedTitle',
    defaultMessage: 'Survey submitted',
  },
  surveySubmittedDescription: {
    id: 'app.containers.IdeasNewPage.SurveySubmittedNotice.surveySubmittedDescription',
    defaultMessage: 'You have already completed this survey.',
  },
  thanksForResponse: {
    id: 'app.containers.IdeasNewPage.SurveySubmittedNotice.thanksForResponse',
    defaultMessage: 'Thanks for your response!',
  },
  returnToProject: {
    id: 'app.containers.IdeasNewPage.SurveySubmittedNotice.returnToProject',
    defaultMessage: 'Return to project',
  },
  surveyNotActiveTitle: {
    id: 'app.containers.IdeasNewPage.SurveyNotActiveNotice.surveyNotActiveTitle',
    defaultMessage: 'This survey is not currently active.',
  },
  surveyNotActiveDescription: {
    id: 'app.containers.IdeasNewPage.SurveyNotActiveNotice.surveyNotActiveDescription',
    defaultMessage:
      'This survey is not currently open for responses. Please return to the project for more information.',
  },
});
