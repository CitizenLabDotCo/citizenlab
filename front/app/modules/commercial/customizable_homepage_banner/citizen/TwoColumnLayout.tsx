import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import HeaderContent from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/pages-menu/containers/HeroBanner/HeaderImageDropzone';
import useHomepageSettings from 'hooks/useHomepageSettings';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: normal;
  `}
`;

const HeaderImage = styled(Image)`
  height: ${homepageBannerLayoutHeights.two_column_layout.desktop}px;
  max-width: 50%;
  overflow: hidden;

  ${media.smallerThanMinTablet`
    max-width: 100%;
    height: ${homepageBannerLayoutHeights.two_column_layout.phone}px;
  `}
`;

const TwoColumnLayout = () => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.data.attributes.header_bg?.large;

    return (
      <Container data-cy="e2e-two-column-layout-container">
        {headerImage && (
          <HeaderImage
            src={headerImage}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
          />
        )}
        <HeaderContent fontColors="dark" align="left" />
      </Container>
    );
  }

  return null;
};

export default TwoColumnLayout;
