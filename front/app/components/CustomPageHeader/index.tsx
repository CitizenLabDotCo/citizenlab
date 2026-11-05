import React, { ReactNode } from 'react';

import FixedRatioLayout from './FixedRatioLayout';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';
import { CustomPageBannerContent } from './types';

export type Props = {
  banner: CustomPageBannerContent;
  // Each layout has a slot for the edit button, and the page fills it.
  adminEditButton?: ReactNode;
};

const CustomPageHeader = ({ banner, adminEditButton }: Props) => {
  switch (banner.layout) {
    case 'full_width_banner_layout':
      return (
        <FullWidthBannerLayout
          banner={banner}
          adminEditButton={adminEditButton}
        />
      );
    case 'two_column_layout':
      return (
        <TwoColumnLayout banner={banner} adminEditButton={adminEditButton} />
      );
    case 'two_row_layout':
      return <TwoRowLayout banner={banner} adminEditButton={adminEditButton} />;
    case 'fixed_ratio_layout':
      return (
        <FixedRatioLayout banner={banner} adminEditButton={adminEditButton} />
      );
  }
};

export default CustomPageHeader;
