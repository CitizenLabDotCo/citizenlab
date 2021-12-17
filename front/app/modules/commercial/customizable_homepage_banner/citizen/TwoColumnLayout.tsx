import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import HeaderContent from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from '../BannerLayoutHeights';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 0;

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
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const headerImage = appConfiguration.data.attributes.header_bg?.large;

    return (
      <Container>
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
