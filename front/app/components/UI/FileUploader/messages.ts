import { defineMessages } from 'react-intl';

export default defineMessages({
  fileUploadLabel: {
    id: 'app.components.FileUploader.fileUploadLabel',
    defaultMessage: 'Add files',
  },
  selectAFile: {
    id: 'app.components.FileUploader.selectAFile',
    defaultMessage: 'Select a file',
  },
  chooseFromExistingFiles: {
    id: 'app.components.FileUploader.chooseFromExistingFiles',
    defaultMessage: 'Choose from existing files',
  },
  fileSelectModalTitle: {
    id: 'app.components.FileUploader.fileSelectModalTitle',
    defaultMessage: 'Select existing file',
  },
  or: {
    id: 'app.components.FileUploader.or',
    defaultMessage: 'or',
  },
  fileAttachedSuccessfully: {
    id: 'app.components.FileUploader.fileAttachedSuccessfully',
    defaultMessage: 'Attached: {fileName}',
  },
  uploadFiles: {
    id: 'app.components.FileUploader.uploadFiles',
    defaultMessage: 'Upload new files',
  },
  selectFile: {
    id: 'app.components.FileUploader.selectFile',
    defaultMessage: 'Select file',
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
