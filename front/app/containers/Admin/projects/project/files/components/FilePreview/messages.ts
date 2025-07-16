import { defineMessages } from 'react-intl';

export default defineMessages({
  previewNotSupported: {
    id: 'app.containers.AdminPage.ProjectFiles.previewNotSupported',
    defaultMessage: 'Preview not yet supported for this file type.',
  },
  filePreviewLabel: {
    id: 'app.containers.AdminPage.ProjectFiles.filePreviewLabel',
    defaultMessage: 'File preview',
  },
  downloadFile: {
    id: 'app.containers.AdminPage.ProjectFiles.downloadFile',
    defaultMessage: 'Download file',
  },
  couldNotLoadMarkdown: {
    id: 'app.containers.AdminPage.ProjectFiles.couldNotLoadMarkdown',
    defaultMessage: 'Could not load markdown file.',
  },
  csvPreviewError: {
    id: 'app.containers.AdminPage.ProjectFiles.csvPreviewError',
    defaultMessage: 'Could not load CSV preview.',
  },
  csvPreviewLimit: {
    id: 'app.containers.AdminPage.ProjectFiles.csvPreviewLimit',
    defaultMessage: 'Maximum 50 rows are shown in CSV previews.',
  },
  downloadFullFile: {
    id: 'app.containers.AdminPage.ProjectFiles.downloadFullFile',
    defaultMessage: 'Download full file',
  },
  csvPreviewTooLarge: {
    id: 'app.containers.AdminPage.ProjectFiles.csvPreviewTooLarge',
    defaultMessage: 'CSV file is too large to preview.',
  },
});
