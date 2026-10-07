import React from 'react';

import { Box, Spinner, colors } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';

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
  const redesign = useProjectBackofficeRedesign();

  if (!project) {
    return (
      <Box
        minHeight="100%"
        background={redesign ? colors.grey100 : colors.background}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  const slug = project.data.attributes.slug;

  const openContentBuilder = () => {
    clHistory.push(
      `/admin/project-page-builder/projects/${projectId}${window.location.search}`
    );
  };

  return (
    <PhonePreviewBackdrop>
      <PagePreview
        src={`/${locale}/projects/${slug}${window.location.search}`}
        iframeTitle={formatMessage(messages.projectPagePreviewTitle)}
        editPageContentAriaLabel={formatMessage(
          messages.editProjectPageInContentBuilder
        )}
        onEdit={openContentBuilder}
        dataCy="e2e-project-page-preview"
        editPageContentClassName="intercom-product-tour-project-edit-project"
      />
    </PhonePreviewBackdrop>
  );
};

export default ProjectPage;
