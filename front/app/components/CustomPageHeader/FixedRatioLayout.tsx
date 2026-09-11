import React, { ReactNode } from 'react';

import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioLayout';
import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import HeaderContent from './HeaderContent';
import { CustomPageBannerContent } from './types';

export interface Props {
  banner: CustomPageBannerContent;
  adminEditButton?: ReactNode;
}

const CustomPageLayoutContainer = styled(Container)`
  background: ${colors.white};
`;

const CustomPageLayoutHeader = styled(Header)`
  max-width: ${stylingConsts.maxPageWidth}px;
`;

const FixedRatioLayout = ({ banner, adminEditButton }: Props) => {
  const { imageUrl, overlayColor, overlayOpacity } = banner;

  return (
    <CustomPageLayoutContainer data-testid="fixed-ratio-layout">
      <CustomPageLayoutHeader>
        <HeaderImage>
          <HeaderImageBackground
            data-testid="header-image-background"
            src={imageUrl}
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
          banner={banner}
        />
      </CustomPageLayoutHeader>
      {adminEditButton}
    </CustomPageLayoutContainer>
  );
};

export default FixedRatioLayout;
