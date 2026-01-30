import React from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';

import ContentContainer from 'components/ContentContainer';
import { Container } from 'components/LandingPages/citizen/TwoRowLayout';
import Image from 'components/UI/Image';

interface Props {
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const HeaderImage = styled(Image)<{
  desktopHeight: number;
  tabletHeight: number;
  phoneHeight: number;
}>`
  width: 100%;
  height: ${(props) => props.desktopHeight}px;
  overflow: hidden;

  ${media.tablet`
    height: ${(props) => props.tabletHeight}px;
  `}

  ${media.phone`
    height: ${(props) => props.phoneHeight}px;
  `}
`;

const TwoRowLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;

  // Get custom heights or fall back to layout defaults
  const layoutDefaults = homepageBannerLayoutHeights.two_row_layout;
  const desktopHeight =
    homepageSettings.banner_signed_out_header_height_desktop ??
    layoutDefaults.desktop;
  const tabletHeight =
    homepageSettings.banner_signed_out_header_height_tablet ??
    layoutDefaults.tablet;
  const phoneHeight =
    homepageSettings.banner_signed_out_header_height_phone ??
    layoutDefaults.phone;

  return (
    <Box
      data-testid="two-row-layout"
      data-cy="e2e-two-row-layout-container"
      width="100%"
      background="white"
    >
      {headerImage && (
        <Box data-testid="two-row-layout-header-image">
          <HeaderImage
            src={headerImage}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
            desktopHeight={desktopHeight}
            tabletHeight={tabletHeight}
            phoneHeight={phoneHeight}
          />
        </Box>
      )}
      <ContentContainer mode="page">
        <Container>
          <HeaderContent
            fontColors="dark"
            homepageSettings={homepageSettings}
          />
        </Container>
      </ContentContainer>
    </Box>
  );
};

export default TwoRowLayout;
