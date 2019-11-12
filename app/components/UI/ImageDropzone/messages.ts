import { defineMessages } from 'react-intl';

export default defineMessages({
  errorImageMaxSizeExceeded: {
    id: 'app.components.ImageDropzone.errorImageMaxSizeExceeded',
    defaultMessage: 'The selected image exceeds the maximum allowed size of {maxFileSize} Mb',
  },
  uploadImage: {
    id: 'app.components.ImageDropzone.uploadImage',
    defaultMessage: 'Upload an image',
  },
  unkownError: {
    id: 'app.components.ImageDropzone.unkownError',
    defaultMessage: 'There was an issue uploading your image, please try again later.',
  },
});
