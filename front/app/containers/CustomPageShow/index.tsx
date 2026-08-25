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
  // Rendered both at the global `/pages/:slug` route and the project-scoped
  // `/projects/:slug/pages/:pageSlug` route, so accept either param.
  const { slug, pageSlug } = useParams({ strict: false }) as {
    slug?: string;
    pageSlug?: string;
  };
  const pageSlugToUse = pageSlug ?? slug;
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();
  const { data: page, isError } = useCustomPageBySlug(pageSlugToUse);
  // Only global custom pages are on the Content Builder, mirroring the backend's
  // provisioning guard. This component also serves policy pages, which reach it through the
  // `/pages/:slug` catch-all, and project-scoped pages; neither ever has a layout, so they
  // must not wait on a request that can only 404.
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

  // The page sections wait for the layout query rather than rendering and being replaced the
  // moment it resolves. The viewer holds the page while it is in flight.
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
        <Container>
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
            <NoBannerContainer>
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
        </Container>
      </main>
    </>
  );
};

export default CustomPageShow;
