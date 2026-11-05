import React from 'react';

import {
  Shimmer,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

interface Props {
  homepageSettingColor?: string;
  homepageSettingOpacity?: number;
  desktopHeight: number;
  tabletHeight: number;
  phoneHeight: number;
}

const Skeleton = ({
  homepageSettingColor,
  homepageSettingOpacity,
  desktopHeight,
  tabletHeight,
  phoneHeight,
}: Props) => {
  const smallerThanPhone = useBreakpoint('phone');
  const smallerThanTablet = useBreakpoint('tablet');

  const getHeight = () => {
    if (smallerThanPhone) return phoneHeight;
    if (smallerThanTablet) return tabletHeight;
    return desktopHeight;
  };

  const getColor = () => {
    if (!homepageSettingColor) return colors.grey300;
    if (!homepageSettingOpacity) return homepageSettingColor;
    if (homepageSettingOpacity < 30) return colors.grey300;
    return homepageSettingColor;
  };

  return <Shimmer w="100%" h={`${getHeight()}px`} bgColor={getColor()} />;
};

export default Skeleton;
