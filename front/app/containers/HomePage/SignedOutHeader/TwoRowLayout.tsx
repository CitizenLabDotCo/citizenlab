import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';
import HeaderContent from 'containers/HomePage/SignedOutHeader/HeaderContent';
import React from 'react';
import { IHomepageSettingsData } from 'services/homepageSettings';
import styled from 'styled-components';

interface Props {
  homepageSettings: IHomepageSettingsData;
}

const TwoRowLayoutContainer = styled.div`
  width: 100%;
`;

const TwoRowLayout = ({ homepageSettings }: Props) => {
  const headerImage = homepageSettings.attributes.header_bg?.large;

  return (
    <TwoRowLayoutContainer data-testid="two-row-layout">
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
    </TwoRowLayoutContainer>
  );
};

export default TwoRowLayout;
