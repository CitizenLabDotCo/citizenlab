import { defineMessages } from 'react-intl';

export default defineMessages({
  delete: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.delete',
    defaultMessage: 'Delete',
  },
  edit: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.edit',
    defaultMessage: 'Edit',
  },
  print: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.print',
    defaultMessage: 'Print',
  },
  confirmDeleteReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.confirmDeleteReport',
    defaultMessage: 'Are you sure you want to delete "{reportName}"?',
  },
  confirmDeleteThisReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.confirmDeleteThisReport',
    defaultMessage: 'Are you sure you want to delete this report?',
  },
  createdOn: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.createdOn',
    defaultMessage: 'Created on: {date}',
  },
  lastUpdate: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.lastUpdate',
    defaultMessage:
      'Last update: {days, plural, no {# days} one {# day} other {# days}} ago by {author}',
  },
  cannotEditReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.cannotEditReport2',
    defaultMessage:
      "You cannot edit this report because it contains data that you don't have access to.",
  },
});
