import { defineMessages } from 'react-intl';

export default defineMessages({
  dropFilesHereOr: {
    id: 'app.containers.Admin.projects.project.dropFilesHereOr',
    defaultMessage: 'Drop files here or',
  },
  supportedFileTypes: {
    id: 'app.containers.Admin.projects.project.supportedFileTypes',
    defaultMessage:
      'All file types are supported, such as audio (WAV, MP3), documents (PDF, DOCX, PPTX) and images (PNG, JPG).',
  },
  filesCountWithSize: {
    id: 'app.containers.Admin.projects.project.filesCountWithSize',
    defaultMessage: '{count, plural, one {# file} other {# files}} · {size}',
  },
});
