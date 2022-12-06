import React from 'react';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoColumnLayout';

const TwoColumnLayout = () => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.attributes.header_bg?.large;

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
