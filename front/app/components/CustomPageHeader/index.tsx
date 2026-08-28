import React, { ReactNode } from 'react';

import { ICustomPageData } from 'api/custom_pages/types';

import FixedRatioLayout from './FixedRatioLayout';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

interface Props {
  pageData: ICustomPageData;
  // Passed in rather than imported: the button belongs to the page, which knows whether it
  // is rendering one for the whole page instead. Keeps this out of a container's folder.
  adminEditButton?: ReactNode;
}

const CustomPageHeader = ({ pageData, adminEditButton }: Props) => {
  const pageAttributes = pageData.attributes;
  return (
    <>
      {pageAttributes.banner_layout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout
          pageData={pageData}
          adminEditButton={adminEditButton}
        />
      )}
      {pageAttributes.banner_layout === 'two_column_layout' && (
        <TwoColumnLayout
          pageData={pageData}
          adminEditButton={adminEditButton}
        />
      )}
      {pageAttributes.banner_layout === 'two_row_layout' && (
        <TwoRowLayout pageData={pageData} adminEditButton={adminEditButton} />
      )}
      {pageAttributes.banner_layout === 'fixed_ratio_layout' && (
        <FixedRatioLayout
          pageData={pageData}
          adminEditButton={adminEditButton}
        />
      )}
    </>
  );
};

export default CustomPageHeader;
