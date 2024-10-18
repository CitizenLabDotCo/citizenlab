import React from 'react';

import { Multiloc } from 'typings';

import useProjectImage from 'api/project_images/useProjectImage';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './SpotlightProject';

interface Props {
  buttonTextMultiloc: Multiloc;
}

const PROJECT_ID = '825ed7f5-0aa2-4cf4-93c7-083e0b05e639';

const SpotlightProject = ({ buttonTextMultiloc }: Props) => {
  const { data: project } = useProjectById(PROJECT_ID);
  const { data: image } = useProjectImage({
    projectId: PROJECT_ID,
    imageId: project?.data.relationships.project_images?.data[0].id,
  });

  const localize = useLocalize();

  if (!project) return null;

  const avatarIds =
    project.data.relationships.avatars?.data?.map((avatar) => avatar.id) ?? [];

  return (
    <SpotlightProjectInner
      title={localize(project.data.attributes.title_multiloc)}
      description={localize(project.data.attributes.description_multiloc)}
      buttonText={localize(buttonTextMultiloc)}
      imgSrc={image?.data.attributes.versions.large ?? undefined}
      avatarIds={avatarIds}
      userCount={project.data.attributes.participants_count}
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
