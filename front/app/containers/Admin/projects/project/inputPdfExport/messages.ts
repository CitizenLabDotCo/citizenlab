import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.pageTitle',
    defaultMessage: 'Export responses to PDF',
  },
  coverSectionTitle: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.coverSectionTitle',
    defaultMessage: 'Cover settings',
  },
  includeCoverLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.includeCoverLabel',
    defaultMessage: 'Include a cover page',
  },
  reportTitleLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.reportTitleLabel',
    defaultMessage: 'Report title',
  },
  reportSubtitleLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.reportSubtitleLabel',
    defaultMessage: 'Subtitle',
  },
  dateLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.dateLabel',
    defaultMessage: 'Date',
  },
  preparedByLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.preparedByLabel',
    defaultMessage: 'Prepared by',
  },
  notesLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.notesLabel',
    defaultMessage: 'Additional notes (optional)',
  },
  fieldReviewSectionTitle: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.fieldReviewSectionTitle2',
    defaultMessage: 'Review fields for PII',
  },
  fieldReviewWithFlags: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.fieldReviewWithFlags',
    defaultMessage:
      '{flaggedCount, plural, one {# field is} other {# fields are}} flagged as potential personal data and excluded by default. Toggle any field to include or exclude it.',
  },
  fieldReviewNoFlags: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.fieldReviewNoFlags',
    defaultMessage:
      'No fields were automatically flagged as personal data. Toggle any field to exclude it from the export.',
  },
  includeStatus: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.includeStatus',
    defaultMessage: 'Included',
  },
  excludeStatus: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.excludeStatus',
    defaultMessage: 'Excluded',
  },
  consentLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.consentLabel',
    defaultMessage:
      'I confirm I have the authority to process and export this data, including any personal data included above.',
  },
  previewLabel: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.previewLabel',
    defaultMessage: 'Cover preview',
  },
  coverDisabledPreview: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.coverDisabledPreview',
    defaultMessage: 'The cover page is turned off.',
  },
  previewError: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.previewError',
    defaultMessage: 'Could not load the preview.',
  },
  zoomIn: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.zoomIn',
    defaultMessage: 'Zoom in',
  },
  zoomOut: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.zoomOut',
    defaultMessage: 'Zoom out',
  },
  cancelButton: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.cancelButton',
    defaultMessage: 'Cancel',
  },
  generateButton: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.generateButton',
    defaultMessage: 'Generate PDF',
  },
  exportError: {
    id: 'app.containers.Admin.projects.project.inputPdfExport.exportError',
    defaultMessage:
      'Something went wrong generating the PDF. Please try again.',
  },
});
