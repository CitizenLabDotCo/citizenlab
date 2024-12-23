import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';

import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';

interface Props {
  homepageSettings: Partial<IHomepageBannerSettings>;
}

const TwoRowLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.header_bg?.large;

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
