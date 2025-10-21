import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useProjectFolderImage from 'api/project_folder_images/useProjectFolderImage';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useProjectImage from 'api/project_images/useProjectImage';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './Spotlight';

interface Props {
  publicationId?: string;
  publicationType?: 'project' | 'folder';
  titleMultiloc?: Multiloc;
  descriptionMultiloc?: Multiloc;
  buttonTextMultiloc: Multiloc;
  hideAvatars?: boolean;
}

const Spotlight = ({
  publicationId,
  publicationType,
  titleMultiloc,
  descriptionMultiloc,
  buttonTextMultiloc,
  hideAvatars,
}: Props) => {
  // If publicationType === 'project'
  const projectId = publicationType === 'project' ? publicationId : undefined;
  const { data: project, isError: isErrorProject } = useProjectById(projectId);
  const projectImageId =
    project?.data.relationships.project_images?.data[0]?.id;
  const { data: projectImage } = useProjectImage({
    projectId,
    imageId: projectImageId,
  });

  // If publicationType === 'folder'
  const folderId = publicationType === 'folder' ? publicationId : undefined;
  const { data: folder, isError: isErrorFolder } =
    useProjectFolderById(folderId);
  const folderImageId = folder?.data.relationships.images.data?.[0]?.id;
  const { data: folderImage } = useProjectFolderImage({
    folderId,
    imageId: folderImageId,
  });

  const locale = useLocale();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (isErrorProject || isErrorFolder) {
    return <Box />;
  }

  if (!publicationId) {
    return (
      <SpotlightProjectInner
        title={formatMessage(messages.selectProjectOrFolder)}
        description={formatMessage(messages.pleaseSelectAProjectOrFolder)}
        loading={false}
        hideAvatars={hideAvatars}
      />
    );
  }

  const publication = publicationType === 'project' ? project : folder;
  const image = publicationType === 'project' ? projectImage : folderImage;

  const avatarIds =
    publication?.data.relationships.avatars?.data?.map((avatar) => avatar.id) ??
    undefined;

  const link = publication
    ? `/${publicationType}s/${publication.data.attributes.slug}`
    : undefined;

  const getLoading = () => {
    if (publicationType === 'project') {
      return !project;
    }

    if (publicationType === 'folder') {
      return !folder;
    }

    return false;
  };

  return (
    <SpotlightProjectInner
      title={localize(titleMultiloc)}
      description={localize(descriptionMultiloc)}
      buttonText={buttonTextMultiloc[locale]} // We don't use localize here because it
      // always falls back to another locale when the value is an empty string.
      // In this case we don't want that- we just want the empty string.
      buttonLink={link}
      imgSrc={image?.data.attributes.versions.large ?? undefined}
      loading={getLoading()}
      avatarIds={avatarIds}
      hideAvatars={hideAvatars}
      userCount={publication?.data.attributes.participants_count}
    />
  );
};

Spotlight.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.spotlightTitle,
  },
};

export const spotlightTitle = messages.spotlightTitle;
export const buttonTextDefault = messages.buttonTextDefault;

export default Spotlight;
