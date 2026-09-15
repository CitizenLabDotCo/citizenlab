import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';

import useLocalize from 'hooks/useLocalize';

import { BUILDER_CONTENT_MAX_WIDTH } from 'components/admin/ContentBuilder/constants';
import CustomPageContentViewer from 'components/CustomPageBuilder/ContentViewer';
import useCustomPageBuilderContent from 'components/CustomPageBuilder/ContentViewer/useCustomPageBuilderContent';
import { Container, Content } from 'components/LandingPages/citizen';
import PageNotFound from 'components/PageNotFound';

import { useParams } from 'utils/router';

import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import LegacyPageHeader from './LegacyPageHeader';
import PageSections from './PageSections';

// Builder content is one white block, so the page's grey would only show as a strip below it.
const PageContainer = styled(Container)<{ builderContent: boolean }>`
  ${({ builderContent, theme }) =>
    builderContent && `background: ${theme.colors.white};`}
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
          {showBuilderContent ? (
            // The layout owns the header: its Banner and Title widgets replace the legacy
            // one, so the page renders only the edit button. Full width or the flex parent
            // collapses the anchor to nothing and the button lands mid-page; it lines up
            // with the content unless a full-bleed banner puts it at the window edge.
            <Box
              position="relative"
              w="100%"
              maxWidth={
                builderContent.startsWithBanner
                  ? undefined
                  : BUILDER_CONTENT_MAX_WIDTH
              }
              zIndex="40000"
            >
              <AdminCustomPageEditButton
                pageId={page.data.id}
                projectId={pageAttributes.project_id}
              />
            </Box>
          ) : (
            <LegacyPageHeader page={page.data} />
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
