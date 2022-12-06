import React from 'react';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';

const TwoRowLayout = () => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.attributes.header_bg?.large;

    return (
      <>
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
        <ContentContainer mode="page">
          <Container>
            <HeaderContent fontColors="dark" />
          </Container>
        </ContentContainer>
      </>
    );
  }

  return null;
};

export default TwoRowLayout;
