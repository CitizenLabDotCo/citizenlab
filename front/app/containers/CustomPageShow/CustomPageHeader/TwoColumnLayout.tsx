import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import React from 'react';
import { ICustomPageData } from 'services/customPages';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';

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
  pageData: ICustomPageData;
}

const TwoColumnLayout = ({ pageData }: Props) => {
  const pageAttributes = pageData.attributes;
  const imageUrl = pageAttributes.header_bg?.large;
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
        fontColors="dark"
        hasHeaderBannerImage={imageUrl != null}
        pageAttributes={pageAttributes}
      />
      <AdminCustomPageEditButton pageId={pageData.id} />
    </Container>
  );
};

export default TwoColumnLayout;
