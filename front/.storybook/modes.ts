import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';

const stripPx = (str: any, attr: 'width' | 'height') => {
  if (typeof str?.[attr] !== 'string') throw new Error('');

  return Number(str?.[attr].replace('px', ''));
}

export const allModes = {
  default: {
    viewport: {
      width: 1280
    }
  },

  tablet: {
    viewport: {
      width: stripPx(MINIMAL_VIEWPORTS.tablet?.styles, 'width'),
      height: stripPx(MINIMAL_VIEWPORTS.tablet?.styles, 'height')
    }
  },

  mobile: {
    viewport: {
      width: stripPx(MINIMAL_VIEWPORTS.mobile2?.styles, 'width'),
      height: stripPx(MINIMAL_VIEWPORTS.mobile2?.styles, 'height'),
    }
  }
};
