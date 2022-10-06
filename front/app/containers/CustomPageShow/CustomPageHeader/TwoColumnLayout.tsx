import React from 'react';
import HeaderContent from './HeaderContent';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import { Multiloc } from 'typings';

export const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  ${media.phone`
    flex-direction: column;
    align-items: normal;
  `}
`;

export const HeaderImage = styled(Image)`
  height: ${homepageBannerLayoutHeights.two_column_layout.desktop}px;
  max-width: 50%;
  overflow: hidden;

  ${media.phone`
    max-width: 100%;
    height: ${homepageBannerLayoutHeights.two_column_layout.phone}px;
  `}
`;

interface Props {
  imageUrl?: string;
  headerMultiloc: Multiloc;
  subheaderMultiloc: Multiloc;
  ctaButtonType: 'customized_button' | 'no_button';
  ctaButtonUrl: string | null;
  ctaButtonMultiloc: Multiloc;
}

const TwoColumnLayout = ({
  imageUrl,
  headerMultiloc,
  subheaderMultiloc,
  ctaButtonType,
  ctaButtonUrl,
  ctaButtonMultiloc,
}: Props) => {
  return (
    <Container data-cy="e2e-two-column-layout-container">
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
      <HeaderContent
        headerMultiloc={headerMultiloc}
        subheaderMultiloc={subheaderMultiloc}
        hasHeaderBannerImage={imageUrl != null}
        fontColors="dark"
        ctaButtonUrl={ctaButtonUrl}
        ctaButtonType={ctaButtonType}
        ctaButtonMultiloc={ctaButtonMultiloc}
      />
    </Container>
  );
};

export default TwoColumnLayout;
