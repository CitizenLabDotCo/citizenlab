import { BoxProps, stylingConsts } from '@citizenlab/cl2-component-library';

import { MIN_VIEWPORT_HEIGHT_FOR_STICKY_ELEMENTS } from 'utils/styleConstants';

type Params = {
  isSmallerThanTablet: boolean;
  windowHeight: number;
};

export const getVerticalPositionProps = ({
  isSmallerThanTablet,
  windowHeight,
}: Params): BoxProps => {
  // Normal desktop screen
  if (!isSmallerThanTablet) {
    return {
      position: 'sticky',
      top: `${stylingConsts.menuHeight}px`,
    };
  }

  // Normal phone screen
  if (windowHeight > MIN_VIEWPORT_HEIGHT_FOR_STICKY_ELEMENTS) {
    return {
      id: 'project-cta-bar-bottom',
      position: 'fixed',
      bottom: '0px',
    };
  }

  // Weird small 400% zoom a11y screen
  return {
    position: 'sticky',
    top: '0px',
  };
};
