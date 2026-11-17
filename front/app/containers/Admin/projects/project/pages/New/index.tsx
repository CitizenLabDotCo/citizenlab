import React from 'react';

import useProjectById from 'api/projects/useProjectById';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import BuilderPageLayout from '../BuilderPageLayout';
import messages from '../messages';
import ProjectPageForm from '../ProjectPageForm';

const NewProjectPage = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return null;
  }

  return (
    <BuilderPageLayout
      projectId={projectId}
      title={formatMessage(messages.newPageTitle)}
    >
      <ProjectPageForm project={project.data} />
    </BuilderPageLayout>
  );
};

export default NewProjectPage;
