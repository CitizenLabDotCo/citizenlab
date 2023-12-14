import React from 'react';

import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioLayout';
import HeaderContent from './HeaderContent';

import { ICustomPageData } from 'api/custom_pages/types';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

export interface Props {
  pageData: ICustomPageData;
}

const CustomPageLayoutContainer = styled(Container)`
  background: ${colors.white};
`;

const CustomPageLayoutHeader = styled(Header)`
  max-width: ${stylingConsts.maxPageWidth}px;
`;

const FixedRatioLayout = ({ pageData }: Props) => {
  const imageUrl = pageData.attributes.header_bg?.large;
  const overlayColor = pageData.attributes.banner_overlay_color;
  const overlayOpacity = pageData.attributes.banner_overlay_opacity;

  return (
    <CustomPageLayoutContainer data-testid="fixed-ratio-layout">
      <CustomPageLayoutHeader>
        <HeaderImage>
          <HeaderImageBackground
            data-testid="header-image-background"
            src={imageUrl || null}
          />
          {overlayColor && typeof overlayOpacity === 'number' && (
            <HeaderImageOverlay
              overlayColor={overlayColor}
              overlayOpacity={overlayOpacity}
            />
          )}
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
