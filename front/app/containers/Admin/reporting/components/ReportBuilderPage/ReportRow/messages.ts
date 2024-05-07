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
  duplicate: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.duplicate',
    defaultMessage: 'Duplicate',
  },
  confirmDeleteReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.confirmDeleteReport1',
    defaultMessage:
      'Are you sure you want to delete "{reportName}"? This action cannot be undone.',
  },
  confirmDeleteThisReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.confirmDeleteThisReport1',
    defaultMessage:
      'Are you sure you want to delete this report? This action cannot be undone.',
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
  cannotDuplicateReport: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.cannotDuplicateReport',
    defaultMessage:
      "You cannot duplicate this report because it contains data that you don't have access to.",
  },
});
