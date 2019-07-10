import { defineMessages } from 'react-intl';

export default defineMessages({
  errorImageMaxSizeExceeded: {
    id: 'app.components.ImageDropzone.errorImageMaxSizeExceeded',
    defaultMessage: 'The selected image exceeds the maximum allowed size of {maxFileSize} Mb',
  },
  errorImagesMaxSizeExceeded: {
    id: 'app.components.ImageDropzone.errorImagesMaxSizeExceeded',
    defaultMessage: 'One or more selected images exceeds the maximum allowed size of {maxFileSize} Mb per image',
  },
  dropYourImageHere: {
    id: 'app.components.ImageDropzone.dropYourImageHere',
    defaultMessage: 'Drop your image here or click to upload.',
  },
});
