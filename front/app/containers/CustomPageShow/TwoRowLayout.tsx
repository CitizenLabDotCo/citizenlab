import React from 'react';
import HeaderContent from './HeaderContent';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import Image from 'components/UI/Image';
import { media } from 'utils/styleUtils';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import { Multiloc } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  ${media.tablet`
    padding: 0;
  `}
`;

const HeaderImage = styled(Image)`
  width: 100%;
  height: ${homepageBannerLayoutHeights['two_row_layout'].desktop}px;
  overflow: hidden;

  ${media.tablet`
    height: ${homepageBannerLayoutHeights['two_row_layout'].tablet}px;
  `}
`;

export interface Props {
  className?: string;
  imageUrl?: string;
  imageColor?: string;
  imageOpacity?: number;
  headerMultiloc: Multiloc;
  subheaderMultiloc: Multiloc;
}

const TwoRowLayout = ({ imageUrl, headerMultiloc, subheaderMultiloc }) => {
  return (
    <>
      {imageUrl && (
        <HeaderImage
          src={imageUrl}
          cover={true}
          fadeIn={false}
          isLazy={false}
          placeholderBg="transparent"
          alt=""
        />
      )}
      <ContentContainer mode="page">
        <Container>
          <HeaderContent
            headerMultiloc={headerMultiloc}
            subheaderMultiloc={subheaderMultiloc}
            hasHeaderBannerImage={imageUrl != null}
            fontColors="light"
          />
        </Container>
      </ContentContainer>
    </>
  );
};

export default TwoRowLayout;
