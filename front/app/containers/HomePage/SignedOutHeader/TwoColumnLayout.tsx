import React from 'react';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';

import {
  Container,
  HeaderImageWrapper,
  HeaderImage,
  TextWrapper,
} from 'components/LandingPages/citizen/TwoColumnLayout';

interface Props {
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const TwoColumnLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;

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
