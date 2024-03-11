import { defineMessages } from 'react-intl';

export default defineMessages({
  reportBuilder: {
    id: 'app.modules.commercial.report_builder.admin.components.TopBar.reportBuilder',
    defaultMessage: 'Report builder',
  },
  quitReportConfirmationQuestion: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.quitReportConfirmationQuestion',
    defaultMessage: 'Are you sure you want to leave?',
  },
  quitReportInfo: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.quitReportInfo2',
    defaultMessage: "Your current changes won't be saved.",
  },
  confirmQuitButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.confirmQuitButtonText1',
    defaultMessage: 'Yes, I want to leave',
  },
  cancelQuitButtonText: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.cancelQuitButtonText',
    defaultMessage: 'Cancel',
  },
  goBackButtonMessage: {
    id: 'app.containers.AdminPage.ProjectEdit.survey.goBackButtonMessage',
    defaultMessage: 'Go back',
  },
  cannotPrint: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.cannotPrint',
    defaultMessage:
      'This report contains unsaved changes. Please save before printing.',
  },
});
