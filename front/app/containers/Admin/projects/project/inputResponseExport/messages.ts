import { defineMessages } from 'react-intl';

export default defineMessages({
  pdfPageTitle: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.pdfPageTitle',
    defaultMessage: 'Export responses to PDF',
  },
  xlsxPageTitle: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.xlsxPageTitle',
    defaultMessage: 'Export responses to Excel',
  },
  coverSectionTitle: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.coverSectionTitle',
    defaultMessage: 'Cover settings',
  },
  includeCoverLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.includeCoverLabel',
    defaultMessage: 'Include a cover page',
  },
  reportTitleLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.reportTitleLabel',
    defaultMessage: 'Report title',
  },
  reportSubtitleLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.reportSubtitleLabel',
    defaultMessage: 'Subtitle',
  },
  dateLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.dateLabel',
    defaultMessage: 'Date',
  },
  preparedByLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.preparedByLabel',
    defaultMessage: 'Prepared by',
  },
  notesLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.notesLabel',
    defaultMessage: 'Additional notes (optional)',
  },
  fieldReviewSectionTitle: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.fieldReviewSectionTitle',
    defaultMessage: 'Review fields for PII',
  },
  fieldReviewWithFlags: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.fieldReviewWithFlags',
    defaultMessage:
      '{flaggedCount, plural, one {# field is} other {# fields are}} flagged as potential personal data and excluded by default. Toggle any field to include or exclude it.',
  },
  fieldReviewNoFlags: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.fieldReviewNoFlags',
    defaultMessage:
      'No fields were automatically flagged as personal data. Toggle any field to exclude it from the export.',
  },
  fieldsError: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.fieldsError',
    defaultMessage:
      'Could not load the fields for this export. Please close this window and try again.',
  },
  includeStatus: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.includeStatus',
    defaultMessage: 'Included',
  },
  excludeStatus: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.excludeStatus',
    defaultMessage: 'Excluded',
  },
  consentLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.consentLabel',
    defaultMessage:
      'I confirm I have the authority to process and export this data, including any personal data included above.',
  },
  previewLabel: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.previewLabel',
    defaultMessage: 'Cover preview',
  },
  coverDisabledPreview: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.coverDisabledPreview',
    defaultMessage: 'The cover page is turned off.',
  },
  previewError: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.previewError',
    defaultMessage: 'Could not load the preview.',
  },
  zoomIn: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.zoomIn',
    defaultMessage: 'Zoom in',
  },
  zoomOut: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.zoomOut',
    defaultMessage: 'Zoom out',
  },
  cancelButton: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.cancelButton',
    defaultMessage: 'Cancel',
  },
  generatePdfButton: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.generatePdfButton',
    defaultMessage: 'Generate PDF',
  },
  generateXlsxButton: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.generateXlsxButton',
    defaultMessage: 'Generate Excel file',
  },
  exportError: {
    id: 'app.containers.Admin.projects.project.inputResponseExport.exportError',
    defaultMessage:
      'Something went wrong generating the file. Please try again.',
  },
});
