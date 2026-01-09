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
  cannotPrint: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.cannotPrint',
    defaultMessage:
      'This report contains unsaved changes. Please save before printing.',
  },
  titleTaken: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.titleTaken',
    defaultMessage: 'Title is already taken',
  },
  downloadWord: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.downloadWord',
    defaultMessage: 'Download Word',
  },
  cannotDownload: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.cannotDownload',
    defaultMessage:
      'This report contains unsaved changes. Please save before downloading.',
  },
  downloadingWord: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.downloadingWord',
    defaultMessage: 'Preparing Word document...',
  },
  downloadError: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.downloadError',
    defaultMessage: 'Failed to download Word document. Please try again.',
  },
});
