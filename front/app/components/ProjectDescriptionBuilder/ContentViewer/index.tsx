import React from 'react';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

import Viewer from './Viewer';

const ContentViewer = ({ params: { slug } }: WithRouterProps) => {
  const { data: project } = useProjectBySlug(slug);
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  if (!featureEnabled || !project) {
    return null;
  }

  return (
    <Viewer
      projectId={project.data.id}
      projectTitle={project.data.attributes.title_multiloc}
    />
  );
};

export default withRouter(ContentViewer);
