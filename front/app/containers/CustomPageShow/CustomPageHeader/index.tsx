import React from 'react';

import { ICustomPageData } from 'api/custom_pages/types';

import FixedRatioLayout from './FixedRatioLayout';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

interface Props {
  pageData: ICustomPageData;
}

const CustomPageHeader = ({ pageData }: Props) => {
  const pageAttributes = pageData.attributes;
  return (
    <>
      {pageAttributes.banner_layout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout pageData={pageData} />
      )}
      {pageAttributes.banner_layout === 'two_column_layout' && (
        <TwoColumnLayout pageData={pageData} />
      )}
      {pageAttributes.banner_layout === 'two_row_layout' && (
        <TwoRowLayout pageData={pageData} />
      )}
      {pageAttributes.banner_layout === 'fixed_ratio_layout' && (
        <FixedRatioLayout pageData={pageData} />
      )}
    </>
  );
};

export default CustomPageHeader;
