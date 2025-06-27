import { defineMessages } from 'react-intl';

export default defineMessages({
  info: {
    id: 'app.components.Admin.ImageCropper.info',
    defaultMessage:
      'This image is always cropped to a certain ratio to make sure all crucial aspects are on display at all times. The {link} for this image type is { aspect }.',
  },
  infoLinkText: {
    id: 'app.components.Admin.ImageCropper.infoLinkText',
    defaultMessage: 'recommended ratio',
  },
  imageSupportPageURL: {
    id: 'app.components.Admin.ImageCropper.imageSupportPageURL',
    defaultMessage:
      'https://support.govocal.com/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  mobileCropExplanation: {
    id: 'app.components.Admin.ImageCropper.mobileCropExplanation',
    defaultMessage:
      'Note: Any important area of the image should be contained within the vertical dashed lines, as the image will be cropped to a 3:1 ratio on mobile devices.',
  },
});
