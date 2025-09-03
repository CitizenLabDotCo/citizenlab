import React from 'react';

import {
  Shimmer,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { heights } from '..';

interface Props {
  homepageSettingColor?: string;
  homepageSettingOpacity?: number;
}

const Skeleton = ({ homepageSettingColor, homepageSettingOpacity }: Props) => {
  const smallerThanPhone = useBreakpoint('phone');
  const smallerThanTablet = useBreakpoint('tablet');

  const getHeight = () => {
    if (smallerThanPhone) return heights.phone;
    if (smallerThanTablet) return heights.tablet;
    return heights.desktop;
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
