import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.pageTitle',
    defaultMessage: 'Export survey responses to PDF',
  },
  coverSectionTitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.coverSectionTitle',
    defaultMessage: 'Cover settings',
  },
  includeCoverLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.includeCoverLabel',
    defaultMessage: 'Include a cover page',
  },
  reportTitleLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.reportTitleLabel',
    defaultMessage: 'Report title',
  },
  reportSubtitleLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.reportSubtitleLabel',
    defaultMessage: 'Subtitle',
  },
  dateLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.dateLabel',
    defaultMessage: 'Date',
  },
  preparedByLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.preparedByLabel',
    defaultMessage: 'Prepared by',
  },
  notesLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.notesLabel',
    defaultMessage: 'Additional notes (optional)',
  },
  fieldReviewSectionTitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.fieldReviewSectionTitle2',
    defaultMessage: 'Review fields for PII',
  },
  fieldReviewWithFlags: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.fieldReviewWithFlags',
    defaultMessage:
      '{flaggedCount, plural, one {# field is} other {# fields are}} flagged as potential personal data and excluded by default. Toggle any field to include or exclude it.',
  },
  fieldReviewNoFlags: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.fieldReviewNoFlags',
    defaultMessage:
      'No fields were automatically flagged as personal data. Toggle any field to exclude it from the export.',
  },
  includeStatus: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.includeStatus',
    defaultMessage: 'Included',
  },
  excludeStatus: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.excludeStatus',
    defaultMessage: 'Excluded',
  },
  consentLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.consentLabel',
    defaultMessage:
      'I confirm I have the authority to process and export this data, including any personal data included above.',
  },
  previewLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.previewLabel',
    defaultMessage: 'Cover preview',
  },
  coverDisabledPreview: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.coverDisabledPreview',
    defaultMessage: 'The cover page is turned off.',
  },
  previewError: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.previewError',
    defaultMessage: 'Could not load the preview.',
  },
  zoomIn: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.zoomIn',
    defaultMessage: 'Zoom in',
  },
  zoomOut: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.zoomOut',
    defaultMessage: 'Zoom out',
  },
  cancelButton: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.cancelButton',
    defaultMessage: 'Cancel',
  },
  generateButton: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.generateButton',
    defaultMessage: 'Generate PDF',
  },
  exportError: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.exportError',
    defaultMessage:
      'Something went wrong generating the PDF. Please try again.',
  },
});
