import { defineMessages } from 'react-intl';

export default defineMessages({
  choiceCount: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.choiceCount2',
    defaultMessage:
      '{percentage}% ({choiceCount, plural, no {# choices} one {# choice} other {# choices}})',
  },
  responseCount: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.responseCount',
    defaultMessage:
      '{choiceCount, plural, no {# responses} one {# response} other {# responses}}',
  },
  response: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.response',
    defaultMessage:
      '{choiceCount, plural, no {responses} one {response} other {responses}}',
  },
  noAnswer: {
    id: 'app.components.admin.ContentBuilder.Widgets.SurveyQuestionResultWidget.noAnswer',
    defaultMessage: 'No answer',
  },
  surveyResults: {
    id: 'app.components.admin.Graphs.SurveyBars.surveyResults',
    defaultMessage: 'Survey results',
  },
});
