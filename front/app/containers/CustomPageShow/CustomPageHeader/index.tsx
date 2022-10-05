import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

const CustomPageHeader = ({
  headerLayout,
  header_bg,
  headerMultiloc,
  subheaderMultiloc,
  headerColor,
  headerOpacity,
}) => {
  return (
    <>
      {headerLayout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout
          imageUrl={header_bg.large}
          imageColor={headerColor}
          imageOpacity={headerOpacity}
          headerMultiloc={headerMultiloc}
          subheaderMultiloc={subheaderMultiloc}
        />
      )}
      {headerLayout === 'two_column_layout' && (
        <TwoColumnLayout
          imageUrl={header_bg.large}
          headerMultiloc={headerMultiloc}
          subheaderMultiloc={subheaderMultiloc}
        />
      )}
      {headerLayout === 'two_row_layout' && (
        <TwoRowLayout
          imageUrl={header_bg.large}
          headerMultiloc={headerMultiloc}
          subheaderMultiloc={subheaderMultiloc}
        />
      )}
    </>
  );
};

export default CustomPageHeader;
