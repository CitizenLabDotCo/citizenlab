import React from 'react';

import { Multiloc } from 'typings';

import useProjectImage from 'api/project_images/useProjectImage';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './SpotlightProject';

interface Props {
  buttonTextMultiloc: Multiloc;
}

const PROJECT_ID = '367ee225-e7f8-4e56-a874-204573ac812d';

const SpotlightProject = ({ buttonTextMultiloc }: Props) => {
  const { data: project } = useProjectById(PROJECT_ID);
  const { data: image } = useProjectImage({
    projectId: PROJECT_ID,
    imageId: project?.data.relationships.project_images?.data[0].id,
  });
  const locale = useLocale();
  const localize = useLocalize();

  if (!project) return null;

  const avatarIds =
    project.data.relationships.avatars?.data?.map((avatar) => avatar.id) ?? [];

  return (
    <SpotlightProjectInner
      title={localize(project.data.attributes.title_multiloc)}
      description={localize(
        project.data.attributes.description_preview_multiloc
      )}
      buttonText={buttonTextMultiloc[locale]} // We don't use localize here because it
      // always falls back to another locale when the value is an empty string.
      // In this case we don't want that- we just want the empty string.
      buttonLink={`/projects/${project.data.attributes.slug}`}
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
export const buttonTextDefault = messages.buttonTextDefault;

export default SpotlightProject;
