import React from 'react';

import { IconTooltip, Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAddProjectFolderModerator from 'api/project_folder_moderators/useAddProjectFolderModerator';
import useDeleteProjectFolderModerator from 'api/project_folder_moderators/useDeleteProjectFolderModerator';
import useProjectFolderModerators from 'api/project_folder_moderators/useProjectFolderModerators';

import AddModerator from 'components/admin/AddModerator';
import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import ModeratorsTable from './ModeratorsTable';

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const FolderPermissions = () => {
  const { projectFolderId } = useParams() as { projectFolderId: string };
  const { mutate: deleteFolderModerator, isLoading: deleteIsLoading } =
    useDeleteProjectFolderModerator();
  const { mutateAsync: addFolderModerator } = useAddProjectFolderModerator();
  const { formatMessage } = useIntl();
  const { data: folderModerators } = useProjectFolderModerators({
    projectFolderId,
  });

  const handleDeleteFolderModeratorClick = (moderatorId: string) => () => {
    deleteFolderModerator({ projectFolderId, userId: moderatorId });
  };

  return (
    <Box
      width="100%"
      mb="25px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Box width="100%">
        <SubSectionTitle>
          <FormattedMessage {...messages.folderManagerSectionTitle} />
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.folderManagerTooltip}
                values={{
                  projectManagementInfoCenterLink: (
                    <StyledA
                      href={formatMessage(messages.moreInfoFolderManagerLink2)}
                      target="_blank"
                    >
                      <FormattedMessage
                        {...messages.projectManagementInfoCenterLinkText}
                      />
                    </StyledA>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>

        <Box>
          <AddModerator
            folderId={projectFolderId}
            onAddModerator={async (params) => {
              await addFolderModerator({
                ...params,
                projectFolderId,
              });
            }}
          />
        </Box>
        {folderModerators && (
          <Box mt="20px">
            <ModeratorsTable moderators={folderModerators.data} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FolderPermissions;
