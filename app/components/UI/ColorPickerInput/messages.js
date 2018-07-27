import { defineMessages } from 'react-intl';

export default defineMessages({
  contrastRatioTooLow: {
    id: 'app.components.ColorPicketInput.contrastRatioTooLow',
    defaultMessage: 'The color you picked has a contrast ratio of {contrastRatio} on a white background. We advise to pick a darker color (with a contrast ratio of at least 4.50) to make sure every citizen can clearly see the color.',
  },
});
