import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { IOption } from 'typings';
import { useParams } from 'react-router-dom';
// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import useProjectFolderModerators from 'hooks/useProjectFolderModerators';
import useAuthUser from 'hooks/useAuthUser';
import {
  addFolderModerator,
  deleteFolderModerator,
} from 'services/projectFolderModerators';

// i18n
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { IconTooltip, Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
import AddCollaboratorsModal from 'components/admin/AddCollaboratorsModal';
import UserSelect from 'components/UI/UserSelect';

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const UserSelectSection = styled.section`
  display: flex;
  margin-bottom: 12px;
`;

const AddButton = styled(Button)`
  margin-left: 12px;
`;

const FolderPermissions = () => {
  const { projectFolderId } = useParams() as { projectFolderId: string };
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const folderModerators = useProjectFolderModerators(projectFolderId);

  const [selectedUserOptions, setSelectedUserOptions] = useState<IOption[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] = useState<string | null>(null);

  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  };

  const handleOnChange = (userId: string) => {
    setModeratorToAdd(userId);
  };

  const handleOnAddFolderModeratorsClick = useCallback(() => {
    if (moderatorToAdd) {
      setProcessing(true);
      addFolderModerator(projectFolderId, moderatorToAdd);
      setProcessing(false);
      setSelectedUserOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserOptions]);

  const handleDeleteFolderModeratorClick =
    (projectFolderId: string, moderatorId: string) => () => {
      deleteFolderModerator(projectFolderId, moderatorId);
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
                      href={formatMessage(messages.moreInfoFolderManagerLink)}
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

        <UserSelectSection>
          <Box display="flex" alignItems="center" mb="12px">
            <Box width="500px">
              <UserSelect
                id="folderModeratorUserSearch"
                inputId="folderModeratorUserSearchInputId"
                value={moderatorToAdd}
                onChange={handleOnChange}
                placeholder={formatMessage(messages.searchFolderManager)}
              />
            </Box>
            <AddButton
              text={formatMessage(messages.addFolderManager)}
              buttonStyle="cl-blue"
              icon="plus-circle"
              padding="10px 16px"
              onClick={openModal}
              disabled={!moderatorToAdd}
              processing={processing}
            />
          </Box>
          <AddCollaboratorsModal
            addModerators={handleOnAddFolderModeratorsClick}
            showModal={showModal}
            closeModal={closeModal}
            noOfCollaboratorSeatsToAdd={selectedUserOptions.length}
          />
        </UserSelectSection>

        <List>
          <>
            {!isNilOrError(folderModerators) &&
              !isNilOrError(authUser) &&
              folderModerators.map((folderModerator, index) => (
                <Row
                  key={folderModerator.id}
                  isLastItem={index === folderModerators.length - 1}
                >
                  <Box display="flex" alignItems="center">
                    <Box mr="8px">
                      <Avatar userId={folderModerator.id} size={30} />
                    </Box>
                    <Text as="span" m={'0'}>
                      {`${folderModerator.attributes.first_name} ${folderModerator.attributes.last_name}`}
                    </Text>
                  </Box>
                  <Text as="span" m={'0'}>
                    {folderModerator.attributes.email}
                  </Text>
                  <Button
                    onClick={handleDeleteFolderModeratorClick(
                      projectFolderId,
                      folderModerator.id
                    )}
                    buttonStyle="text"
                    icon="delete"
                    disabled={
                      !isNilOrError(authUser) &&
                      authUser.id === folderModerator.id
                    }
                  >
                    <FormattedMessage {...messages.deleteFolderManagerLabel} />
                  </Button>
                </Row>
              ))}
          </>
        </List>
      </Box>
    </Box>
  );
};

export default FolderPermissions;
