import React from 'react';

import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import BuilderPageLayout from '../BuilderPageLayout';
import messages from '../messages';
import ProjectPageForm from '../ProjectPageForm';

const NewProjectPage = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const customPageBuilderEnabled = useFeatureFlag({
    name: 'custom_page_builder',
  });

  if (!project) {
    return null;
  }

  const form = <ProjectPageForm project={project.data} />;

  if (!customPageBuilderEnabled) return form;

  return (
    <BuilderPageLayout
      projectId={projectId}
      title={formatMessage(messages.newPageTitle)}
    >
      {form}
    </BuilderPageLayout>
  );
};

export default NewProjectPage;
