import React from 'react';

import { Multiloc } from 'typings';

import useProjectImage from 'api/project_images/useProjectImage';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './SpotlightProject';

interface Props {
  buttonTextMultiloc: Multiloc;
  projectId?: string;
}

const SpotlightProject = ({ buttonTextMultiloc, projectId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const imageId = project?.data.relationships.project_images?.data[0]?.id;
  const { data: image } = useProjectImage({
    projectId,
    imageId,
  });
  const locale = useLocale();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!projectId) {
    return (
      <SpotlightProjectInner
        title={formatMessage(messages.selectProject)}
        description={formatMessage(messages.pleaseSelectAProject)}
      />
    );
  }

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
