import { defineMessages } from 'react-intl';

export default defineMessages({
  fileUploadLabel: {
    id: 'app.components.FileUploader.fileUploadLabel',
    defaultMessage: 'Add files',
  },
  fileInputDescription: {
    id: 'app.components.FileUploader.fileInputDescription',
    defaultMessage: 'Select a file',
  },
  incorrect_extension: {
    id: 'app.components.FileUploader.incorrect_extension',
    defaultMessage:
      '{fileName} is not supported by our system, it will not be uploaded.',
  },
  file_too_large: {
    id: 'app.components.FileUploader.file_too_large2',
    defaultMessage: 'Files larger than {maxSizeMb}MB are not permitted.',
  },
  a11y_removeFile: {
    id: 'app.components.FileUploader.a11y_removeFile',
    defaultMessage: 'Remove this file',
  },
  a11y_noFiles: {
    id: 'app.components.FileUploader.a11y_noFiles',
    defaultMessage: 'No files added.',
  },
  a11y_filesToBeUploaded: {
    id: 'app.components.FileUploader.a11y_filesToBeUploaded',
    defaultMessage: 'Files to be uploaded: {fileNames}',
  },
  a11y_file: {
    id: 'app.components.FileUploader.a11y_file',
    defaultMessage: 'File: ',
  },
});
