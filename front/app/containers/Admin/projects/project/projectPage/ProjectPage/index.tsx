import React from 'react';

import { Box, Spinner, colors } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PagePreview from 'components/admin/PagePreview';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../messages';

const ProjectPage = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/project-page',
  });
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return (
      <Box
        minHeight="100%"
        background={colors.background}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  const slug = project.data.attributes.slug;
  const previewSrc = `/${locale}/projects/${slug}${window.location.search}`;

  const openContentBuilder = () => {
    clHistory.push(
      `/admin/project-page-builder/projects/${projectId}${window.location.search}`
    );
  };

  return (
    <PagePreview
      src={previewSrc}
      iframeTitle={formatMessage(messages.projectPagePreviewTitle)}
      editPageContentAriaLabel={formatMessage(
        messages.editProjectPageInContentBuilder
      )}
      onEdit={openContentBuilder}
      dataCy="e2e-project-page-preview"
      editPageContentClassName="intercom-product-tour-project-edit-project"
    />
  );
};

export default ProjectPage;
