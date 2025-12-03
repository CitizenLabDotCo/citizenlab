import { defineMessages } from 'react-intl';

export default defineMessages({
  fileAttachment: {
    id: 'app.containers.admin.ContentBuilder.fileAttachment',
    defaultMessage: 'File Attachment',
  },
  selectFile: {
    id: 'app.containers.admin.ContentBuilder.selectFile2',
    defaultMessage: 'Select existing file',
  },
  noFilesAvailable: {
    id: 'app.containers.admin.ContentBuilder.noFilesAvailable',
    defaultMessage:
      'No files available. Please upload files to the project first.',
  },
  uploadFiles: {
    id: 'app.containers.admin.ContentBuilder.uploadFiles2',
    defaultMessage: 'Upload files to project',
  },
  fileAlreadyInUse: {
    id: 'app.containers.admin.ContentBuilder.fileAlreadyInUse',
    defaultMessage:
      'This file is already used {count} time{count, plural, one {} other {s}} in this layout',
  },
  fileAlreadySelected: {
    id: 'app.containers.admin.ContentBuilder.fileAlreadySelected',
    defaultMessage: 'Already selected',
  },
});
