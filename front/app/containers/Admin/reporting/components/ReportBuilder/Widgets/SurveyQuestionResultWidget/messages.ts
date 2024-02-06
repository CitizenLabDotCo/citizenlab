import { defineMessages } from 'react-intl';

export default defineMessages({
  singleSurveyQuestion: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.singleSurveyQuestion',
    defaultMessage: 'Single survey question',
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
});
