import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useProjectById from 'api/projects/useProjectById';

import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import ProjectPageForm from '../ProjectPageForm';

const EditProjectPage = () => {
  const { projectId, customPageId } = useParams({ strict: false }) as {
    projectId: string;
    customPageId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: customPage } = useCustomPageById(customPageId);

  if (isNilOrError(customPage) || !project) {
    return null;
  }

  return <ProjectPageForm project={project.data} page={customPage.data} />;
};

export default EditProjectPage;
