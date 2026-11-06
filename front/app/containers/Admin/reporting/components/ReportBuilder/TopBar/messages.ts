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
  download: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.download',
    defaultMessage: 'Download',
  },
  downloadAsPdf: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.downloadAsPdf',
    defaultMessage: 'Download as PDF',
  },
  downloadAsWord: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.downloadAsWord',
    defaultMessage: 'Download as Word',
  },
  titleTaken: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.titleTaken',
    defaultMessage: 'Title is already taken',
  },
  generateReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.generateReport',
    defaultMessage: 'Generate report',
  },
  generatingReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.generatingReport',
    defaultMessage: 'Writing your report. You can close this page.',
  },
  generateReportFailed: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.generateReportFailed',
    defaultMessage: 'Generating the report failed. Please try again.',
  },
  generateReportConfirmationQuestion: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.generateReportConfirmationQuestion',
    defaultMessage: 'Generate this report?',
  },
  generateReportInfo: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.generateReportInfo',
    defaultMessage:
      'It takes a few minutes. You can close this page and come back later. You can edit everything afterwards.',
  },
  generateReportOverwriteInfo: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.generateReportOverwriteInfo',
    defaultMessage:
      'This replaces everything the report contains now. It takes a few minutes, and you can close this page while it runs.',
  },
  cancelGenerateButtonText: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.cancelGenerateButtonText',
    defaultMessage: 'Cancel',
  },
  confirmGenerateButtonText: {
    id: 'app.containers.Admin.reporting.components.ReportBuilder.TopBar.confirmGenerateButtonText',
    defaultMessage: 'Generate report',
  },
});
