import React, { ReactNode } from 'react';

import {
  Container,
  HeaderImageWrapper,
  HeaderImage,
  TextWrapper,
} from 'components/LandingPages/citizen/TwoColumnLayout';

import HeaderContent from './HeaderContent';
import { CustomPageBannerContent } from './types';

interface Props {
  banner: CustomPageBannerContent;
  adminEditButton?: ReactNode;
}

const TwoColumnLayout = ({ banner, adminEditButton }: Props) => {
  const { imageUrl } = banner;

  return (
    <Container
      data-testid="two-column-layout"
      data-cy="e2e-two-column-layout-container"
    >
      {imageUrl && (
        <HeaderImageWrapper>
          <HeaderImage
            src={imageUrl}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
          />
        </HeaderImageWrapper>
      )}
      <TextWrapper>
        <HeaderContent
          align="left"
          fontColors="dark"
          hasHeaderBannerImage={imageUrl != null}
          banner={banner}
        />
        {adminEditButton}
      </TextWrapper>
    </Container>
  );
};

export default TwoColumnLayout;
