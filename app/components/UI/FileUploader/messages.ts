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
    defaultMessage: '{fileName} is not supported by our system, it will not be uploaded.'
  },
  a11y_removeFile: {
    id: 'app.components.FileUploader.a11y_removeFile',
    defaultMessage: 'Remove this file'
  }
});
