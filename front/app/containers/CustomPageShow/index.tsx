import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';
import { isContentBuilderPage } from 'api/custom_pages/util';

import useLocalize from 'hooks/useLocalize';

import {
  BUILDER_CONTENT_MAX_WIDTH,
  DEFAULT_PADDING,
} from 'components/admin/ContentBuilder/constants';
import { useSectionBoundaryMargin } from 'components/admin/ContentBuilder/verticalRhythm';
import CustomPageContentViewer from 'components/CustomPageBuilder/ContentViewer';
import useCustomPageBuilderContent from 'components/CustomPageBuilder/ContentViewer/useCustomPageBuilderContent';
import { Container, Content } from 'components/LandingPages/citizen';
import PageNotFound from 'components/PageNotFound';

import { useParams } from 'utils/router';

import AdminCustomPageEditButton from './AdminCustomPageEditButton';
import BackToProjectLink from './BackToProjectLink';
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
  const isSmallerThanTablet = useBreakpoint('tablet');
  const sectionBoundaryMargin = useSectionBoundaryMargin();
  // Pages off the builder must not wait on a layout request that can only 404.
  const builderContent = useCustomPageBuilderContent(
    page && isContentBuilderPage(page.data) ? page.data.id : undefined
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
            // The layout draws the header, so only the edit button renders here. Full width, or the
            // flex parent collapses its anchor.
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
              {pageAttributes.project_id && (
                // Spaced and aligned like the layout's own content below it.
                <Box
                  maxWidth={BUILDER_CONTENT_MAX_WIDTH}
                  mx="auto"
                  pt={sectionBoundaryMargin}
                  px={isSmallerThanTablet ? DEFAULT_PADDING : undefined}
                >
                  <BackToProjectLink projectId={pageAttributes.project_id} />
                </Box>
              )}
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
