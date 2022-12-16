import {
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';
import {
  Container,
  Header,
} from 'components/LandingPages/citizen/FixedRatioBannerLayout';
import React from 'react';
import { ICustomPageData } from 'services/customPages';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';
export interface Props {
  className?: string;
  imageColor?: string;
  imageOpacity?: number;
  pageData: ICustomPageData;
}

const LayoutContainer = styled(Container)`
  background: ${colors.white};
`;

const LayoutHeader = styled(Header)`
  max-width: 952px;
`;

const FixedRatioLayout = ({
  className,
  imageColor,
  imageOpacity,
  pageData,
}: Props) => {
  const imageUrl = pageData.attributes.header_bg?.large;

  return (
    <LayoutContainer className={`e2e-signed-out-header ${className}`}>
      <LayoutHeader id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-cy="e2e-header-image-background"
            src={imageUrl || null}
          />
          <HeaderImageOverlay
            overlayColor={imageColor}
            overlayOpacity={imageOpacity}
          />
        </HeaderImage>
        <HeaderContent
          fontColors="light"
          hasHeaderBannerImage={imageUrl != null}
          pageAttributes={pageData.attributes}
        />
      </LayoutHeader>
      <AdminCustomPageEditButton pageId={pageData.id} />
    </LayoutContainer>
  );
};

export default FixedRatioLayout;
