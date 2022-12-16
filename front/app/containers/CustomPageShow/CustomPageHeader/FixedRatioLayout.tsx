import React from 'react';

import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioBannerLayout';
import HeaderContent from './HeaderContent';

import { ICustomPageData } from 'services/customPages';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import { colors, stylingConsts } from 'utils/styleUtils';
import styled from 'styled-components';

export interface Props {
  className?: string;
  imageColor?: string;
  imageOpacity?: number;
  pageData: ICustomPageData;
}

const CustomPageLayoutContainer = styled(Container)`
  background: ${colors.white};
`;

const CustomPageLayoutHeader = styled(Header)`
  max-width: ${stylingConsts.maxPageWidth}px; ;
`;

const FixedRatioLayout = ({ imageColor, imageOpacity, pageData }: Props) => {
  const imageUrl = pageData.attributes.header_bg?.large;

  return (
    <CustomPageLayoutContainer>
      <CustomPageLayoutHeader>
        <HeaderImage>
          <HeaderImageBackground src={imageUrl || null} />
          <HeaderImageOverlay
            overlayColor={imageColor}
            overlayOpacity={imageOpacity}
          />
        </HeaderImage>
        <HeaderContent
          fontColors="light"
          hasHeaderBannerImage={imageUrl != null}
          pageAttributes={pageData.attributes}
        />
      </CustomPageLayoutHeader>
      <AdminCustomPageEditButton pageId={pageData.id} />
    </CustomPageLayoutContainer>
  );
};

export default FixedRatioLayout;
