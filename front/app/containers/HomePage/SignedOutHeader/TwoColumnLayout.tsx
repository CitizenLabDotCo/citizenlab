import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoColumnLayout';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import React from 'react';
import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/HomepageBanner';
import { Box } from '@citizenlab/cl2-component-library';

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
        <Box
          minWidth="50%"
          data-testid="homepage-two-column-layout-header-image"
        >
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
      <HeaderContent
        fontColors="dark"
        align="left"
        homepageSettings={homepageSettings}
      />
    </Container>
  );
};

export default TwoColumnLayout;
