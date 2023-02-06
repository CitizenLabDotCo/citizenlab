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
});
