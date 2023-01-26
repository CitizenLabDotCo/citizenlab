import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import React from 'react';
import { IHomepageSettingsData } from 'services/homepageSettings';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  homepageSettings: IHomepageSettingsData;
}

const TwoRowLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.attributes.header_bg?.large;

  return (
    <Box data-testid="two-row-layout" width="100%" background="white">
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
          <HeaderContent fontColors="dark" />
        </Container>
      </ContentContainer>
    </Box>
  );
};

export default TwoRowLayout;
