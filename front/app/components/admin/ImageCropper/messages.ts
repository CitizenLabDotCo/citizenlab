import { defineMessages } from 'react-intl';

export default defineMessages({
  infoLinkText: {
    id: 'app.components.Admin.ImageCropper.infoLinkText',
    defaultMessage: 'recommended ratio',
  },
  imageSupportPageURL: {
    id: 'app.components.Admin.ImageCropper.imageSupportPageURL',
    defaultMessage:
      'https://support.govocal.com/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  cropSentenceOne: {
    id: 'app.components.Admin.ImageCropper.cropSentenceOne',
    defaultMessage: 'The image is cropped automatically:',
  },
  cropSentenceTwo: {
    id: 'app.components.Admin.ImageCropper.cropSentenceTwo',
    defaultMessage: '{aspect} on desktop (full width shown)',
  },
  cropSentenceThree: {
    id: 'app.components.Admin.ImageCropper.cropSentenceThree',
    defaultMessage:
      '3:1 on mobile (only the area between the dotted lines is shown)',
  },
  cropSentenceFour: {
    id: 'app.components.Admin.ImageCropper.cropSentenceFour',
    defaultMessage:
      "Keep key content inside the dotted lines to ensure it's always visible.",
  },
  cropSentenceFive: {
    id: 'app.components.Admin.ImageCropper.cropSentenceFive',
    defaultMessage: 'See also: {link}.',
  },
});
