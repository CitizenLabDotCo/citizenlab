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
  view: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.view',
    defaultMessage: 'View',
  },
  share: {
    id: 'app.containers.Admin.reporting.components.ReportBuilderPage.ReportRow.share',
    defaultMessage: 'Share',
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
});
