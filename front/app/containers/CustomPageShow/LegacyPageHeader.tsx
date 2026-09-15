import React from 'react';

import {
  Box,
  fontSizes,
  isRtl,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ICustomPageData } from 'api/custom_pages/types';

import useLocalize from 'hooks/useLocalize';

import ContentContainer from 'components/ContentContainer';
import CustomPageHeader from 'components/CustomPageHeader';

import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import BackToProjectLink from './BackToProjectLink';
import bannerContentFromPage from './bannerContentFromPage';

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${isRtl`
    text-align: right;
    direction: rtl;
  `}
`;

const NoBannerContainer = styled(ContentContainer)`
  background: #fff;
  padding: 50px 50px 50px 50px;

  ${media.tablet`
    padding: 50px 20px 50px 20px;
  `}
`;

// When a banner is shown, the back link sits above it sharing the same
// horizontal padding, with little vertical space so it hugs the banner.
const BackLinkContainer = styled(ContentContainer)`
  background: #fff;
  padding: 50px 50px 8px 50px;

  ${media.tablet`
    padding: 50px 20px 8px 20px;
  `}
`;

type Props = {
  page: ICustomPageData;
};

// The header a page renders from its own columns: the banner when it has one, otherwise the
// page title. A page on the content builder renders neither; its layout owns the header.
const LegacyPageHeader = ({ page }: Props) => {
  const localize = useLocalize();
  const pageAttributes = page.attributes;

  if (pageAttributes.banner_enabled) {
    return (
      <>
        {pageAttributes.project_id && (
          <BackLinkContainer>
            <BackToProjectLink projectId={pageAttributes.project_id} />
          </BackLinkContainer>
        )}
        <Box background="#fff" width="100%">
          <CustomPageHeader
            banner={bannerContentFromPage(pageAttributes)}
            adminEditButton={
              <AdminCustomPageEditButton
                pageId={page.id}
                projectId={pageAttributes.project_id}
              />
            }
          />
        </Box>
      </>
    );
  }

  return (
    <NoBannerContainer>
      {pageAttributes.project_id && (
        <Box mb="8px">
          <BackToProjectLink projectId={pageAttributes.project_id} />
        </Box>
      )}
      <PageTitle>{localize(pageAttributes.title_multiloc)}</PageTitle>
      <Box zIndex="40000">
        <AdminCustomPageEditButton
          pageId={page.id}
          projectId={pageAttributes.project_id}
        />
      </Box>
    </NoBannerContainer>
  );
};

export default LegacyPageHeader;
