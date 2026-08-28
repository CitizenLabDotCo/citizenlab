import React from 'react';

import { ICustomPageData } from 'api/custom_pages/types';

import FixedRatioLayout from './FixedRatioLayout';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

interface Props {
  pageData: ICustomPageData;
  // The builder renders one edit button for the whole page instead, since a page may have
  // no banner at all.
  showAdminEditButton?: boolean;
}

const CustomPageHeader = ({ pageData, showAdminEditButton = true }: Props) => {
  const pageAttributes = pageData.attributes;
  return (
    <>
      {pageAttributes.banner_layout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout
          pageData={pageData}
          showAdminEditButton={showAdminEditButton}
        />
      )}
      {pageAttributes.banner_layout === 'two_column_layout' && (
        <TwoColumnLayout
          pageData={pageData}
          showAdminEditButton={showAdminEditButton}
        />
      )}
      {pageAttributes.banner_layout === 'two_row_layout' && (
        <TwoRowLayout
          pageData={pageData}
          showAdminEditButton={showAdminEditButton}
        />
      )}
      {pageAttributes.banner_layout === 'fixed_ratio_layout' && (
        <FixedRatioLayout
          pageData={pageData}
          showAdminEditButton={showAdminEditButton}
        />
      )}
    </>
  );
};

export default CustomPageHeader;
