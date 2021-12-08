import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';
import HeaderContent from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Image from 'components/UI/Image';

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
  height: 532px;
  max-width: 50%;
  overflow: hidden;

  ${media.smallerThanMinTablet`
    max-width: 100%;
    height: 240px;
  `}
`;

const Layout2 = () => {
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

export default Layout2;
