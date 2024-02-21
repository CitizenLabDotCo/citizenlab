import { defineMessages } from 'react-intl';

export default defineMessages({
  surveyQuestion: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.surveyQuestion',
    defaultMessage: 'Survey question',
  },
  emptyField: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.emptyField',
    defaultMessage: 'No question selected. Please select a question first.',
  },
  numberOfResponses: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.numberOfResponses',
    defaultMessage: '{count} responses',
  },
  sourceAndReference: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.sourceAndReference',
    defaultMessage: 'Data from {phase} during {period}',
  },
  untilNow: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.untilNow',
    defaultMessage: '{date} until now',
  },
  noAnswer: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.noAnswer',
    defaultMessage: 'No answer',
  },
});
