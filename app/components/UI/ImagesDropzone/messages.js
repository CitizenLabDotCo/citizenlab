import { defineMessages } from 'react-intl';

export default defineMessages({
  errorImageMaxSizeExceeded: {
    id: 'app.components.Upload.errorImageMaxSizeExceeded',
    defaultMessage: 'The selected image exceeds the maximum allowed size of {maxFileSize} Mb',
  },
  errorImagesMaxSizeExceeded: {
    id: 'app.components.Upload.errorImagesMaxSizeExceeded',
    defaultMessage: 'One or more selected images exceeds the maximum allowed size of {maxFileSize} Mb per image',
  },
  remaining: {
    id: 'app.components.Upload.remaining',
    defaultMessage: `remaining`,
  },
  onlyOneImage: {
    id: 'app.components.Upload.onlyOneImage',
    defaultMessage: 'You can only upload 1 image',
  },
  onlyXImages: {
    id: 'app.components.Upload.onlyXImages',
    defaultMessage: 'You can only upload {maxItemsCount} images',
  },
  dropYourImageHere: {
    id: 'app.components.Upload.dropYourImageHere',
    defaultMessage: 'Drop your image here',
  },
  dropYourImagesHere: {
    id: 'app.components.Upload.dropYourImagesHere',
    defaultMessage: 'Drop your images here',
  },
});
