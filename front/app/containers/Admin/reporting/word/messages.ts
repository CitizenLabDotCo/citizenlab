import { defineMessages } from 'react-intl';

export default defineMessages({
  wordExportFailed: {
    id: 'app.containers.Admin.reporting.word.wordExportFailed',
    defaultMessage: 'Failed to export Word document.',
  },
  wordExportMissingWidget: {
    id: 'app.containers.Admin.reporting.word.wordExportMissingWidget',
    defaultMessage:
      'One of the report widgets could not be found while exporting.',
  },
  wordExportCaptureFailed: {
    id: 'app.containers.Admin.reporting.word.wordExportCaptureFailed',
    defaultMessage:
      'One of the report widgets could not be captured for export.',
  },
  reportFallbackTitle: {
    id: 'app.containers.Admin.reporting.word.reportFallbackTitle',
    defaultMessage: 'Report',
  },
});
