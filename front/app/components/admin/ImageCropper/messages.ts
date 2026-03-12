import { defineMessages } from 'react-intl';

export default defineMessages({
  infoLinkText: {
    id: 'app.components.Admin.ImageCropper.infoLinkText',
    defaultMessage: 'recommended ratio',
  },
  imageSupportPageURL2: {
    id: 'app.components.Admin.ImageCropper.imageSupportPageURL2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527652-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  cropSentenceOne: {
    id: 'app.components.Admin.ImageCropper.cropSentenceOne',
    defaultMessage: 'The image is cropped automatically:',
  },
  cropSentenceTwo: {
    id: 'app.components.Admin.ImageCropper.cropSentenceTwo',
    defaultMessage: '{aspect} on desktop (full width shown)',
  },
  cropSentenceMobileRatio: {
    id: 'app.components.Admin.ImageCropper.cropSentenceMobileRatio',
    defaultMessage:
      '3:1 on mobile (only the area between the dotted lines is shown)',
  },
  cropSentenceMobileCrop: {
    id: 'app.components.Admin.ImageCropper.cropSentenceMobileCrop',
    defaultMessage:
      "Keep key content inside the dotted lines to ensure it's always visible.",
  },
  cropFinalSentence: {
    id: 'app.components.Admin.ImageCropper.cropFinalSentence',
    defaultMessage: 'See also: {link}.',
  },
});
