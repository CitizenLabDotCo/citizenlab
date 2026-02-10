import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';

import {
  Container,
  HeaderImageWrapper,
  TextWrapper,
} from 'components/LandingPages/citizen/TwoColumnLayout';
import Image from 'components/UI/Image';

interface Props {
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const HeaderImage = styled(Image)<{
  phoneHeight: number;
}>`
  width: 100%;
  height: 100%;
  object-fit: cover;

  ${media.phone`
    height: ${(props) => props.phoneHeight}px;
  `}
`;

const TwoColumnLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;

  // For two column layout, only phone height is customizable
  const layoutDefaults = homepageBannerLayoutHeights.two_column_layout;
  const phoneHeight =
    homepageSettings.banner_signed_out_header_height_phone ??
    layoutDefaults.phone;

  return (
    <Container
      data-testid="two-column-layout"
      data-cy="e2e-two-column-layout-container"
    >
      {headerImage && (
        <HeaderImageWrapper data-testid="homepage-two-column-layout-header-image">
          <HeaderImage
            src={headerImage}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
            phoneHeight={phoneHeight}
          />
        </HeaderImageWrapper>
      )}
      <TextWrapper>
        <HeaderContent
          fontColors="dark"
          align="left"
          homepageSettings={homepageSettings}
        />
      </TextWrapper>
    </Container>
  );
};

export default TwoColumnLayout;
