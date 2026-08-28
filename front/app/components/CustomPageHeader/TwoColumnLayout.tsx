import React, { ReactNode } from 'react';

import { ICustomPageData } from 'api/custom_pages/types';

import {
  Container,
  HeaderImageWrapper,
  HeaderImage,
  TextWrapper,
} from 'components/LandingPages/citizen/TwoColumnLayout';

import HeaderContent from './HeaderContent';

interface Props {
  pageData: ICustomPageData;
  adminEditButton?: ReactNode;
}

const TwoColumnLayout = ({ pageData, adminEditButton }: Props) => {
  const pageAttributes = pageData.attributes;
  const imageUrl = pageAttributes.header_bg?.large;

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
          pageAttributes={pageAttributes}
        />
        {adminEditButton}
      </TextWrapper>
    </Container>
  );
};

export default TwoColumnLayout;
