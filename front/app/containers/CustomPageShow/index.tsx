import React from 'react';

import {
  Box,
  fontSizes,
  isRtl,
  media,
} from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';

import useLocalize from 'hooks/useLocalize';

import { BUILDER_CONTENT_MAX_WIDTH } from 'components/admin/ContentBuilder/constants';
import ContentContainer from 'components/ContentContainer';
import CustomPageContentViewer from 'components/CustomPageBuilder/ContentViewer';
import useCustomPageBuilderContent from 'components/CustomPageBuilder/ContentViewer/useCustomPageBuilderContent';
import { Container, Content } from 'components/LandingPages/citizen';
import PageNotFound from 'components/PageNotFound';

import { useParams } from 'utils/router';

import BackToProjectLink from './BackToProjectLink';
import CustomPageHeader from './CustomPageHeader';
import AdminCustomPageEditButton from './CustomPageHeader/AdminCustomPageEditButton';
import PageSections from './PageSections';

// Builder content is one white block, so the page's grey would only show as a strip below it.
const PageContainer = styled(Container)<{ builderContent: boolean }>`
  ${({ builderContent }) => builderContent && 'background: #fff;'}
`;

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

const CustomPageShow = () => {
  // Serves the `/pages/:slug` catch-all — policy pages included — and the project-scoped
  // `/projects/:slug/pages/:pageSlug`, so accept either param.
  const { slug, pageSlug } = useParams({ strict: false }) as {
    slug?: string;
    pageSlug?: string;
  };
  const pageSlugToUse = pageSlug ?? slug;
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();
  const { data: page, isError } = useCustomPageBySlug(pageSlugToUse);
  // Only global custom pages are on the Content Builder, mirroring the backend's provisioning
  // guard. The other pages served here must not wait on a request that can only 404.
  const isGlobalCustomPage =
    page?.data.attributes.code === 'custom' && !page.data.attributes.project_id;
  const builderContent = useCustomPageBuilderContent(
    isGlobalCustomPage ? page.data.id : undefined
  );

  // when neither have loaded
  if (!appConfiguration || !page) {
    return <PageNotFound />;
  }

  if (
    // if URL is mistyped, page is also an error
    isError
  ) {
    return <PageNotFound />;
  }

  // The sections wait for the query rather than rendering and being replaced when it lands.
  const showBuilderContent =
    builderContent.isLoading || builderContent.hasContent;

  const pageAttributes = page.data.attributes;
  const localizedOrgName = localize(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    appConfiguration?.data.attributes.settings.core.organization_name
  );
  return (
    <>
      <Helmet
        title={`${localize(
          pageAttributes.title_multiloc
        )} | ${localizedOrgName}`}
      />
      <main className={`e2e-page-${pageSlugToUse}`}>
        <PageContainer builderContent={showBuilderContent}>
          {pageAttributes.banner_enabled ? (
            <>
              {pageAttributes.project_id && (
                <BackLinkContainer>
                  <BackToProjectLink projectId={pageAttributes.project_id} />
                </BackLinkContainer>
              )}
              <Box background="#fff" width="100%">
                <CustomPageHeader pageData={page.data} />
              </Box>
            </>
          ) : (
            // The container's default is narrower, so the title would not line up with
            // the content under it.
            <NoBannerContainer
              maxWidth={
                showBuilderContent ? BUILDER_CONTENT_MAX_WIDTH : undefined
              }
            >
              {pageAttributes.project_id && (
                <Box mb="8px">
                  <BackToProjectLink projectId={pageAttributes.project_id} />
                </Box>
              )}
              {/* show page text title if the banner is disabled */}
              <PageTitle>{localize(pageAttributes.title_multiloc)}</PageTitle>
              <Box zIndex="40000">
                <AdminCustomPageEditButton
                  pageId={page.data.id}
                  projectId={pageAttributes.project_id}
                />
              </Box>
            </NoBannerContainer>
          )}
          <Content>
            {showBuilderContent ? (
              <CustomPageContentViewer staticPageId={page.data.id} />
            ) : (
              <PageSections page={page.data} />
            )}
          </Content>
        </PageContainer>
      </main>
    </>
  );
};

export default CustomPageShow;
