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

// The page background is grey, and each legacy section paints white over it. Builder content
// is one white block instead, so that grey would only ever show as a strip below it — and no
// other builder puts its content on a coloured page.
// What every builder widget sets as its own max width.
const BUILDER_CONTENT_WIDTH = 1200;

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
          {/* One button for the page, not for a widget: the banner may be absent and the
              title hidden, and every combination still needs a way into the admin editor.
              The box gives its absolute positioning a content-width ancestor to line up
              with, and has no height of its own. `w=100%` is needed because the page
              container centres its flex children, which would otherwise shrink this to its
              (zero-width) absolutely positioned child. A full-bleed banner takes the button
              to the window edge as it does today; without one it lines up with the content.
              The z-index is what the legacy branch already used: the banner is a later,
              positioned sibling, so it paints over the button otherwise. */}
          {showBuilderContent && (
            <Box
              position="relative"
              w="100%"
              maxWidth={
                pageAttributes.banner_enabled
                  ? undefined
                  : `${BUILDER_CONTENT_WIDTH}px`
              }
              zIndex="40000"
            >
              <AdminCustomPageEditButton
                pageId={page.data.id}
                projectId={pageAttributes.project_id}
              />
            </Box>
          )}
          {pageAttributes.banner_enabled ? (
            <>
              {pageAttributes.project_id && (
                <BackLinkContainer>
                  <BackToProjectLink projectId={pageAttributes.project_id} />
                </BackLinkContainer>
              )}
              <Box background="#fff" width="100%">
                <CustomPageHeader
                  pageData={page.data}
                  showAdminEditButton={!showBuilderContent}
                />
              </Box>
            </>
          ) : (
            // Legacy only: with builder content the layout owns the heading, and the edit
            // button is rendered once for the whole page above.
            !showBuilderContent && (
              <NoBannerContainer>
                {pageAttributes.project_id && (
                  <Box mb="8px">
                    <BackToProjectLink projectId={pageAttributes.project_id} />
                  </Box>
                )}
                <PageTitle>{localize(pageAttributes.title_multiloc)}</PageTitle>
                <Box zIndex="40000">
                  <AdminCustomPageEditButton
                    pageId={page.data.id}
                    projectId={pageAttributes.project_id}
                  />
                </Box>
              </NoBannerContainer>
            )
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
