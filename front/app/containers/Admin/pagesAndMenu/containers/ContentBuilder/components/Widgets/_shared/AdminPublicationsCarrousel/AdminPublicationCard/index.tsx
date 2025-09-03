import React from 'react';

import {
  Box,
  Text,
  Icon,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useProjectFolderImage from 'api/project_folder_images/useProjectFolderImage';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useProjectImage from 'api/project_images/useProjectImage';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

import { CardContainer, CardImage } from '../../BaseCard';
import { BIG_CARD_WIDTH, SMALL_CARD_WIDTH } from '../constants';

import messages from './messages';
import { getPublicationURL } from './utils';

interface Props {
  adminPublication: IAdminPublicationData;
  ml?: string;
  mr?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> &
    React.KeyboardEventHandler<HTMLElement>;
}

interface InnerProps extends Props {
  imageUrl?: string;
  avatarIds: string[];
  userCount?: number;
  imageAltText?: string;
}

export const AdminPublicationCard = ({
  adminPublication,
  imageUrl,
  avatarIds,
  userCount,
  imageAltText,
  ml,
  mr,
  onKeyDown,
}: InnerProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();

  const cardWidth = isSmallerThanPhone ? SMALL_CARD_WIDTH : BIG_CARD_WIDTH;

  const {
    visible_children_count,
    publication_title_multiloc,
    publication_description_preview_multiloc,
  } = adminPublication.attributes;

  const { type } = adminPublication.relationships.publication.data;

  return (
    <CardContainer
      as={Link}
      scrollToTop
      tabIndex={0}
      w={`${cardWidth}px`}
      ml={ml}
      mr={mr}
      to={getPublicationURL(adminPublication)}
      display="block"
      onKeyDown={onKeyDown}
    >
      <CardImage imageUrl={imageUrl} alt={imageAltText} />
      <Title variant="h4" as="h3" mt="8px" mb="0px" color="tenantText">
        {localize(publication_title_multiloc)}
      </Title>
      <Box display="flex" flexDirection="row" alignItems="center" mt="8px">
        {type === 'folder' && (
          <>
            <Icon
              name="folder-solid"
              height="20px"
              ml="-2px"
              mr="4px"
              mt="0px"
              fill={theme.colors.tenantPrimary}
            />
            <Text m="0px" mr="12px">
              {formatMessage(messages.xProjects, {
                numberOfProjects: visible_children_count,
              })}
            </Text>
          </>
        )}
        <AvatarBubbles
          avatarIds={avatarIds}
          size={16}
          limit={3}
          userCount={userCount}
          participantsTextFontSize="m"
          showParticipantText={!isSmallerThanPhone}
          userCountBubbleFontSize={10}
        />
      </Box>
      <Text mt="8px" mb="0">
        {truncate(localize(publication_description_preview_multiloc), 280)}
      </Text>
    </CardContainer>
  );
};

const AdminPublicationCardWrapper = ({ adminPublication, ...props }: Props) => {
  const localize = useLocalize();
  const { id, type } = adminPublication.relationships.publication.data;

  const projectId = type === 'project' ? id : undefined;
  const folderId = type === 'folder' ? id : undefined;

  const { data: project } = useProjectById(projectId);
  const { data: folder } = useProjectFolderById(folderId);

  const projectImageId =
    project?.data.relationships.project_images?.data[0]?.id;
  const folderImageId = folder?.data.relationships.images.data?.[0]?.id;

  const { data: projectImage } = useProjectImage({
    projectId,
    imageId: projectImageId,
  });

  const { data: folderImage } = useProjectFolderImage({
    folderId,
    imageId: folderImageId,
  });

  const imageUrl =
    type === 'project'
      ? projectImage?.data.attributes.versions.large
      : folderImage?.data.attributes.versions.large;

  const avatarsRelation =
    type === 'project'
      ? project?.data.relationships.avatars
      : folder?.data.relationships.avatars;

  const avatarIds = avatarsRelation?.data?.map((avatar) => avatar.id) ?? [];

  const userCount =
    type === 'project'
      ? project?.data.attributes.participants_count
      : folder?.data.attributes.participants_count;

  const imageAltText =
    type === 'project'
      ? localize(projectImage?.data.attributes.alt_text_multiloc)
      : localize(folderImage?.data.attributes.alt_text_multiloc);

  return (
    <AdminPublicationCard
      adminPublication={adminPublication}
      imageUrl={imageUrl ?? undefined}
      avatarIds={avatarIds}
      userCount={userCount}
      imageAltText={imageAltText}
      {...props}
    />
  );
};

export default AdminPublicationCardWrapper;
