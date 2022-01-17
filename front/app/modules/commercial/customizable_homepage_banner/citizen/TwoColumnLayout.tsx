import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import HeaderContent from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/settings/customize/Header/HeaderImageDropzone';

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
