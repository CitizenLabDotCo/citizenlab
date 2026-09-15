import React, { ReactNode } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { homepageBannerLayoutHeights } from 'components/admin/GenericHeroBannerForm/HeaderImageDropzone';
import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';

import HeaderContent from './HeaderContent';
import { CustomPageBannerContent } from './types';

interface Props {
  banner: CustomPageBannerContent;
  adminEditButton?: ReactNode;
}

const TwoRowLayout = ({ banner, adminEditButton }: Props) => {
  const { imageUrl } = banner;
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <Box data-testid="two-row-layout" width="100%" background="white">
      <Box
        position="relative"
        // Needed when the Hero banner is turned on, but there is no image yet
        // Otherwise the admin edit button is not clickable.
        height={
          isSmallerThanTablet
            ? `${homepageBannerLayoutHeights['two_row_layout'].tablet}px`
            : `${homepageBannerLayoutHeights['two_row_layout'].desktop}px`
        }
      >
        {imageUrl && (
          <HeaderImage
            src={imageUrl}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
          />
        )}
        {adminEditButton}
      </Box>
      <ContentContainer mode="page">
        <Container>
          <HeaderContent
            hasHeaderBannerImage={imageUrl != null}
            fontColors="dark"
            banner={banner}
          />
        </Container>
      </ContentContainer>
    </Box>
  );
};

export default TwoRowLayout;
