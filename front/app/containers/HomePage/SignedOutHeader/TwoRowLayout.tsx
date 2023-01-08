import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import React from 'react';
import { IHomepageSettingsData } from 'services/homepageSettings';

interface Props {
  homepageSettings: IHomepageSettingsData;
}

const TwoRowLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.attributes.header_bg?.large;

  return (
    <div data-testid="two-row-layout">
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
    </div>
  );
};

export default TwoRowLayout;
