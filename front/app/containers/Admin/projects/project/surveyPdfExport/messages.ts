import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.pageTitle',
    defaultMessage: 'Export survey responses to PDF',
  },
  pageSubtitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.pageSubtitle',
    defaultMessage:
      'Generate a PDF document with every survey response laid out as an individual record.',
  },
  coverSectionTitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.coverSectionTitle',
    defaultMessage: 'Cover page',
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
    id: 'app.containers.Admin.projects.project.surveyPdfExport.fieldReviewSectionTitle',
    defaultMessage: 'Review fields before exporting',
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
  personalDataReason: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.personalDataReason',
    defaultMessage: 'Registration data — excluded by default',
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
  exportButton: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.exportButton',
    defaultMessage: 'Export PDF',
  },
  previewLabel: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.previewLabel',
    defaultMessage: 'Cover preview',
  },
  coverDisabledPreview: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.coverDisabledPreview',
    defaultMessage: 'The cover page is turned off.',
  },
  reviewModalTitle: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.reviewModalTitle',
    defaultMessage: 'Review fields before export',
  },
  cancelButton: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.cancelButton',
    defaultMessage: 'Cancel',
  },
  generateButton: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.generateButton',
    defaultMessage: 'Generate PDF',
  },
  noResponses: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.noResponses',
    defaultMessage: 'There are no survey responses to export yet.',
  },
  responsesFound: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.responsesFound',
    defaultMessage:
      '{count, plural, one {# response} other {# responses}} will be exported.',
  },
  exportError: {
    id: 'app.containers.Admin.projects.project.surveyPdfExport.exportError',
    defaultMessage:
      'Something went wrong generating the PDF. Please try again.',
  },
});
