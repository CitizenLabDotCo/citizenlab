import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';

import {
  Container,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import HeaderContent from './HeaderContent';

interface Props {
  className?: string;
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const Header = styled.div<{
  desktopHeight: number;
  tabletHeight: number;
  phoneHeight: number;
}>`
  width: 100%;
  height: ${(props) => props.desktopHeight}px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.tablet`
    height: ${(props) => props.tabletHeight}px;
  `}

  ${media.phone`
    height: ${(props) => props.phoneHeight}px;
  `}
`;

const FullWidthBannerLayout = ({ className, homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;
  const homepageSettingColor =
    homepageSettings.banner_signed_out_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.banner_signed_out_header_overlay_opacity;

  // Get custom heights or fall back to layout defaults
  const layoutDefaults = homepageBannerLayoutHeights.full_width_banner_layout;
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
    <Container
      data-testid="full-width-banner-layout"
      data-cy="e2e-full-width-banner-layout-container"
      className={`e2e-signed-out-header ${className}`}
    >
      <Header
        id="hook-header"
        desktopHeight={desktopHeight}
        tabletHeight={tabletHeight}
        phoneHeight={phoneHeight}
      >
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-testid="full-width-banner-layout-header-image"
            data-cy="e2e-full-width-banner-layout-header-image"
            src={headerImage || null}
          />
          {homepageSettingColor &&
            typeof homepageSettingOpacity === 'number' && (
              <HeaderImageOverlay
                data-cy="e2e-full-width-layout-header-image-overlay"
                overlayColor={homepageSettingColor}
                overlayOpacity={homepageSettingOpacity}
              />
            )}
        </HeaderImage>

        <HeaderContent fontColors="light" homepageSettings={homepageSettings} />
      </Header>
    </Container>
  );
};

export default FullWidthBannerLayout;
