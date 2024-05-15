import React from 'react';

import {
  Title,
  Icon,
  colors,
  Box,
  Text,
  Button,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useDeleteProjectFolderModerator from 'api/project_folder_moderators/useDeleteProjectFolderModerator';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import { IUserData } from 'api/users/types';

import useLocalize from 'hooks/useLocalize';

import Divider from 'components/admin/Divider';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
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
}: {
  item: IAdminPublicationData;
  isFolder: boolean;
  userId: string;
}) => {
  const { formatMessage } = useIntl();
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
        projectFolderId: item.id,
        id: userId,
      });
    } else {
      deleteProjectModerator({
        projectId: item.id,
        id: userId,
      });
    }
  };

  return (
    <Button
      buttonStyle="text"
      processing={deleteProjectModeratorLoading || deleteFolderModeratorLoading}
      onClick={handleRemove}
      ml="auto"
    >
      {formatMessage(messages.remove)}
    </Button>
  );
};

const UserAssignedItems = ({ user }: { user: IUserData }) => {
  const localize = useLocalize();
  const { data: assignedItems } = useAdminPublications({});
  const flatAssignedItems = assignedItems?.pages?.flatMap((page) => page.data);
  const isFolder = (item: IAdminPublicationData) =>
    item.relationships.publication.data.type === 'folder';

  return (
    <div>
      <Title m="0px">
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
          />
        </Box>
      ))}
    </div>
  );
};

export default UserAssignedItems;
