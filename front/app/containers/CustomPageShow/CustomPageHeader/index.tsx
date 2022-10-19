import React from 'react';
import { ICustomPageAttributes } from 'services/customPages';
import FullWidthBannerLayout from './FullWidthBannerLayout';
import TwoColumnLayout from './TwoColumnLayout';
import TwoRowLayout from './TwoRowLayout';

interface Props {
  pageAttributes: ICustomPageAttributes;
}

const CustomPageHeader = ({ pageAttributes }: Props) => {
  return (
    <>
      {pageAttributes.banner_layout === 'full_width_banner_layout' && (
        <FullWidthBannerLayout pageAttributes={pageAttributes} />
      )}
      {pageAttributes.banner_layout === 'two_column_layout' && (
        <TwoColumnLayout pageAttributes={pageAttributes} />
      )}
      {pageAttributes.banner_layout === 'two_row_layout' && (
        <TwoRowLayout pageAttributes={pageAttributes} />
      )}
    </>
  );
};

export default CustomPageHeader;
