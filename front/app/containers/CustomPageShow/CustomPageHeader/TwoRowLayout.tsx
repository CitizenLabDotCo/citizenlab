import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';
import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import React from 'react';
import { ICustomPageData } from 'services/customPages';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';

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

interface Props {
  pageData: ICustomPageData;
}

const TwoRowLayout = ({ pageData }: Props) => {
  const pageAttributes = pageData.attributes;
  const imageUrl = pageAttributes.header_bg?.large;
  const isTablet = useBreakpoint('tablet');

  return (
    <>
      <Box
        width="100%"
        position="relative"
        height={
          isTablet
            ? `${homepageBannerLayoutHeights['two_row_layout'].tablet}px`
            : `${homepageBannerLayoutHeights['two_row_layout'].desktop}px`
        }
      >
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
        <AdminCustomPageEditButton pageId={pageData.id} />
      </Box>
      <ContentContainer mode="page">
        <Container>
          <HeaderContent
            hasHeaderBannerImage={imageUrl != null}
            fontColors="dark"
            pageAttributes={pageAttributes}
          />
        </Container>
      </ContentContainer>
    </>
  );
};

export default TwoRowLayout;
