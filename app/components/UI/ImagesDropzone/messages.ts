import { defineMessages } from 'react-intl';

export default defineMessages({
  errorImageMaxSizeExceeded: {
    id: 'app.components.Upload.errorImageMaxSizeExceeded',
    defaultMessage:
      'The selected image exceeds the maximum allowed size of {maxFileSize}MB',
  },
  errorImagesMaxSizeExceeded: {
    id: 'app.components.Upload.errorImagesMaxSizeExceeded',
    defaultMessage:
      'One or more selected images exceeds the maximum allowed size of {maxFileSize}MB per image',
  },
  remaining: {
    id: 'app.components.Upload.remaining',
    defaultMessage: 'remaining',
  },
  onlyOneImage: {
    id: 'app.components.Upload.onlyOneImage',
    defaultMessage: 'You can only upload 1 image',
  },
  onlyXImages: {
    id: 'app.components.Upload.onlyXImages',
    defaultMessage: 'You can only upload {maxItemsCount} images',
  },
  uploadImageLabel: {
    id: 'app.components.Upload.uploadImageLabel',
    defaultMessage: 'Select an image (max. {maxImageSizeInMb}MB)',
  },
  uploadMultipleImagesLabel: {
    id: 'app.components.Upload.uploadMultipleImagesLabel',
    defaultMessage: 'Select one or more images',
  },
  a11y_removeImage: {
    id: 'app.components.Upload.a11y_removeImage',
    defaultMessage: 'Remove image',
  },
});
