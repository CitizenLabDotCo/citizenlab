import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import useHomepageSettings from 'hooks/useHomepageSettings';
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

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
