import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useHomepageSettings from 'hooks/useHomepageSettings';
import HeaderContent from 'containers/LandingPage/SignedOutHeader/HeaderContent';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import Image from 'components/UI/Image';
import { media } from 'utils/styleUtils';
import { homepageBannerLayoutHeights } from 'containers/Admin/pages-menu/containers/HeroBanner/HeaderImageDropzone';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const HeaderImage = styled(Image)`
  width: 100%;
  height: ${homepageBannerLayoutHeights['two_row_layout'].desktop}px;
  overflow: hidden;

  ${media.smallerThanMaxTablet`
    height: ${homepageBannerLayoutHeights['two_row_layout'].tablet}px;
  `}
`;

const TwoRowLayout = () => {
  const homepageSettings = useHomepageSettings();

  if (!isNilOrError(homepageSettings)) {
    const headerImage = homepageSettings.data.attributes.header_bg?.large;

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
