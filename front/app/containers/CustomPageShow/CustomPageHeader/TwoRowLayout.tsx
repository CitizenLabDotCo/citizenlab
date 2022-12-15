import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';
import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoRowLayout';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import React from 'react';
import { ICustomPageData } from 'services/customPages';
import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';

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
        // Needed when the Hero banner is turned on, but there is no image yet
        // Otherwise the AdminCustomPageEditButton is not clickable.
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
