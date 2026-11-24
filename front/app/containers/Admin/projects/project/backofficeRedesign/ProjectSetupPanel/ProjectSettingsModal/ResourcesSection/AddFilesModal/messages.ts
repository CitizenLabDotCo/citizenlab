import { defineMessages } from 'react-intl';

export default defineMessages({
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
