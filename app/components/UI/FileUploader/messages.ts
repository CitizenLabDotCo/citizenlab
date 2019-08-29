import { defineMessages } from 'react-intl';

export default defineMessages({
  fileUploadLabel: {
    id: 'app.components.FileUploader.fileUploadLabel',
    defaultMessage: 'Add files',
  },
  fileInputDescription: {
    id: 'app.components.FileUploader.fileInputDescription',
    defaultMessage: 'Select a file to upload...',
  },
  incorrect_extension: {
    id: 'app.components.FileUploader.incorrect_extension',
    defaultMessage: '{fileName} is not supported by our system, it will not be uploaded.',
  },
});
