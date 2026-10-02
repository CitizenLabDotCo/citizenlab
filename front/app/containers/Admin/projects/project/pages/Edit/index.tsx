import React from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { CUSTOM_PAGE_BUILDER_PATH } from 'components/admin/ContentBuilder/constants';
import PagePreview from 'components/admin/PagePreview';
import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../messages';
import ProjectPageForm from '../ProjectPageForm';

const EditProjectPage = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { projectId, customPageId } = useParams({ strict: false }) as {
    projectId: string;
    customPageId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: customPage, dataUpdatedAt } = useCustomPageById(customPageId);
  const { data: layout } = useCustomPageLayout(customPageId);
  const customPageBuilderEnabled = useFeatureFlag({
    name: 'custom_page_builder',
  });
  useEnsureCustomPageLayout(customPageId);

  if (!customPage || !project) {
    return null;
  }

  const form = (
    <ProjectPageForm project={project.data} page={customPage.data} />
  );

  if (!customPageBuilderEnabled) return form;

  const openContentBuilder = () => {
    clHistory.push(`${CUSTOM_PAGE_BUILDER_PATH}/pages/${customPageId}`);
  };

  return (
    <Box display="flex" alignItems="flex-start">
      <Box flex="1" minWidth="0">
        {form}
      </Box>
      {/* The settings can run longer than a screen, so the preview stays in view below the
          header. Its top margin matches the form card's. */}
      <Box
        flex="1"
        minWidth="0"
        mt="44px"
        position="sticky"
        top={`${stylingConsts.menuHeight + 20}px`}
      >
        {/* Without a layout the page renders its legacy sections, so the preview waits for one. */}
        {layout && (
          // The frame runs its own copy of the app, so it is remounted to show a save.
          <PagePreview
            key={dataUpdatedAt}
            src={`/${locale}/projects/${project.data.attributes.slug}/pages/${customPage.data.attributes.slug}`}
            iframeTitle={formatMessage(messages.pagePreviewTitle)}
            editPageContentAriaLabel={formatMessage(
              messages.editPageInContentBuilder
            )}
            onEdit={openContentBuilder}
            dataCy="e2e-project-page-preview-panel"
            alignTop
          />
        )}
      </Box>
    </Box>
  );
};

export default EditProjectPage;
