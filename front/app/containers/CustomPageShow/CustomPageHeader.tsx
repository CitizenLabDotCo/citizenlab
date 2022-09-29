import React from 'react';
import FullWidthBannerLayout from './FullWidthBannerLayout';

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
    </>
  );
};

export default CustomPageHeader;
