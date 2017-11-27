import { defineMessages } from 'react-intl';

export default defineMessages({
  errorMaxSizeExceeded: {
    id: 'app.components.Upload.errorMaxSizeExceeded',
    defaultMessage: 'One or more images exceded the maximum allowed size of {maxFileSize} Mb',
  },
  onlyOneImage: {
    id: 'app.components.Upload.onlyOneImage',
    defaultMessage: 'You can only upload 1 image',
  },
  onlyXImages: {
    id: 'app.components.Upload.onlyXImages',
    defaultMessage: 'You can only upload {maxItemsCount} images',
  },
  limitReached: {
    id: 'app.components.Upload.limitReached',
    defaultMessage: 'Coud not add image(s). The maximum number of allowed images has been reached.',
  },
  dropYourImageHere: {
    id: 'app.components.Upload.dropYourImageHere',
    defaultMessage: 'Drop your image here',
  },
  dropYourImagesHere: {
    id: 'app.components.Upload.dropYourImagesHere',
    defaultMessage: 'Drop your image(s) here',
  },
});
