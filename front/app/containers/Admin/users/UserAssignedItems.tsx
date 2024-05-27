import React from 'react';

import {
  Title,
  Icon,
  colors,
  Box,
  Text,
  Button,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublication from 'api/admin_publications/useAdminPublication';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useDeleteProjectFolderModerator from 'api/project_folder_moderators/useDeleteProjectFolderModerator';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import Divider from 'components/admin/Divider';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { IProjectFolderModeratorRole } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

const StyledLink = styled(Link)`
  color: ${colors.textSecondary};
  text-decoration: underline;
  &:hover {
    color: ${colors.textPrimary};
`;

const RemoveButton = ({
  item,
  isFolder,
  userId,
  disabled,
}: {
  item: IAdminPublicationData;
  isFolder: boolean;
  userId: string;
  disabled?: boolean;
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: folder } = useAdminPublication(
    item.relationships.parent?.data?.id || null
  );
  const {
    mutate: deleteProjectModerator,
    isLoading: deleteProjectModeratorLoading,
  } = useDeleteProjectModerator();
  const {
    mutate: deleteFolderModerator,
    isLoading: deleteFolderModeratorLoading,
  } = useDeleteProjectFolderModerator();

  const handleRemove = () => {
    if (isFolder) {
      deleteFolderModerator({
        projectFolderId: item.relationships.publication.data.id,
        id: userId,
      });
    } else {
      deleteProjectModerator({
        projectId: item.relationships.publication.data.id,
        id: userId,
      });
    }
  };

  const folderTitle = localize(
    folder?.data.attributes.publication_title_multiloc
  );

  return (
    <Tippy
      content={
        <FormattedMessage
          {...messages.removeModeratorFrom}
          values={{ folderTitle }}
        />
      }
      zIndex={9999999}
      disabled={!disabled}
    >
      <Box ml="auto">
        <Button
          buttonStyle="text"
          processing={
            deleteProjectModeratorLoading || deleteFolderModeratorLoading
          }
          onClick={handleRemove}
          disabled={disabled}
        >
          {formatMessage(messages.remove)}
        </Button>
      </Box>
    </Tippy>
  );
};

const UserAssignedItems = ({ user }: { user: IUserData }) => {
  const localize = useLocalize();
  const { data: assignedItems } = useAdminPublications({
    filter_user_is_moderator_of: user.id,
  });
  const flatAssignedItems = assignedItems?.pages?.flatMap((page) => page.data);

  const isFolder = (item: IAdminPublicationData) =>
    item.relationships.publication.data.type === 'folder';

  // Get the folder ids that the user is a moderator of
  const moderatedFolderIds = user.attributes.roles
    ?.filter((role) => role.type === 'project_folder_moderator')
    .map((role: IProjectFolderModeratorRole) => role.project_folder_id);

  // Get the ids for the admin publications of the folder ids that the user is a moderator of
  const moderatedAdminPublicationFolderIds = flatAssignedItems
    ?.filter((item) =>
      moderatedFolderIds?.includes(item.relationships.publication.data.id)
    )
    .map((item) => item.id);

  // Do not allow removing the user from the project if it belongs to a folder that the user is a moderator of
  const isRemoveDisabled = (item: IAdminPublicationData) =>
    Boolean(
      item.relationships.parent.data?.id &&
        moderatedAdminPublicationFolderIds?.includes(
          item.relationships.parent.data?.id
        )
    );

  return (
    <div>
      <Title mb="0px">
        <FormattedMessage
          {...messages.assignedItemsFor}
          values={{ name: getFullName(user) }}
        />
      </Title>
      <Divider />
      {flatAssignedItems?.length === 0 && (
        <Text py="4px">
          <FormattedMessage {...messages.noAssignedItems} />
        </Text>
      )}
      {flatAssignedItems?.map((item) => (
        <Box
          key={item.id}
          display="flex"
          alignItems="center"
          gap="4px"
          py="4px"
        >
          {isFolder(item) && (
            <Icon name="folder-solid" fill={colors.textSecondary} />
          )}
          <StyledLink
            to={
              isFolder(item)
                ? `/folders/${item.attributes.publication_slug}`
                : `/projects/${item.attributes.publication_slug}`
            }
            target="_blank"
          >
            {localize(item.attributes.publication_title_multiloc)}
          </StyledLink>
          <RemoveButton
            item={item}
            isFolder={isFolder(item)}
            userId={user.id}
            disabled={isRemoveDisabled(item)}
          />
        </Box>
      ))}
    </div>
  );
};

export default UserAssignedItems;
