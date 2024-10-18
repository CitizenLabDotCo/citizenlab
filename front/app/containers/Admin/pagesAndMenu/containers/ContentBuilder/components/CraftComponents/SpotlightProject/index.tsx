import React from 'react';

import useProjectImage from 'api/project_images/useProjectImage';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './SpotlightProject';

interface Props {}

const PROJECT_ID = '825ed7f5-0aa2-4cf4-93c7-083e0b05e639';

const SpotlightProject = (_: Props) => {
  const { data: project } = useProjectById(PROJECT_ID);
  const { data: image } = useProjectImage({
    projectId: PROJECT_ID,
    imageId: project?.data.relationships.project_images?.data[0].id,
  });
  const localize = useLocalize();

  if (!project) return null;

  return (
    <SpotlightProjectInner
      title={localize(project.data.attributes.title_multiloc)}
      imgSrc={image?.data.attributes.versions.large ?? undefined}
    />
  );
};

SpotlightProject.craft = {
  related: {
    settings: Settings,
  },
};

export const spotlightProjectTitle = messages.spotlightProject;

export default SpotlightProject;
