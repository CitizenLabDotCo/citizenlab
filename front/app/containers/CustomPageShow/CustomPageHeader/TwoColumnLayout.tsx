import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ICustomPageData } from 'api/custom_pages/types';

import {
  Container,
  HeaderImage,
} from 'components/LandingPages/citizen/TwoColumnLayout';

import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import HeaderContent from './HeaderContent';

interface Props {
  pageData: ICustomPageData;
}

const TwoColumnLayout = ({ pageData }: Props) => {
  const pageAttributes = pageData.attributes;
  const imageUrl = pageAttributes.header_bg?.large;
  return (
    <Container
      data-testid="two-column-layout"
      data-cy="e2e-two-column-layout-container"
    >
      {imageUrl && (
        <Box minWidth="50%">
          <HeaderImage
            src={imageUrl}
            cover={true}
            fadeIn={false}
            isLazy={false}
            placeholderBg="transparent"
            alt=""
          />
        </Box>
      )}
      <HeaderContent
        align="left"
        fontColors="dark"
        hasHeaderBannerImage={imageUrl != null}
        pageAttributes={pageAttributes}
      />
      <AdminCustomPageEditButton pageId={pageData.id} />
    </Container>
  );
};

export default TwoColumnLayout;
