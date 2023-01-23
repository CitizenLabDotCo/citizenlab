import { defineMessages } from 'react-intl';

export default defineMessages({
  surveyResults: {
    id: 'app.containers.admin.ReportBuilder.surveyResults',
    defaultMessage: 'Survey results',
  },
  surveyQuestion: {
    id: 'app.containers.admin.ReportBuilder.surveyQuestion',
    defaultMessage: 'Question',
  },
  surveySettingsTitle: {
    id: 'app.containers.admin.ReportBuilder.surveySettingsTitle',
    defaultMessage: 'Survey title',
  },
  surveyNoResults: {
    id: 'app.containers.admin.ReportBuilder.surveyNoResults',
    defaultMessage:
      'There are no survey results for the filters you have selected.',
  },
  surveyNoQuestions: {
    id: 'app.containers.admin.ReportBuilder.surveyNoQuestions',
    defaultMessage:
      'There are no questions available for this project or phase.',
  },
  surveyChooseQuestions: {
    id: 'app.containers.admin.ReportBuilder.surveyChooseQuestions',
    defaultMessage: 'Choose which questions to display:',
  },
  surveyPhases: {
    id: 'app.containers.admin.ReportBuilder.surveyPhases',
    defaultMessage: 'Survey phases',
  },
  totalParticipants: {
    id: 'app.containers.admin.ReportBuilder.totalParticipants',
    defaultMessage: 'Total participants: {numberOfParticipants}',
  },
  phase: {
    id: 'app.containers.admin.ReportBuilder.phase',
    defaultMessage: 'Phase: {phaseName}',
  },
});
