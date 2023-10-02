import React, { useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils

// services
import useProjectFolderModerators from 'api/project_folder_moderators/useProjectFolderModerators';
import { isRegularUser } from 'utils/permissions/roles';

// i18n
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { IconTooltip, Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
const AddModeratorsModal = lazy(
  () => import('components/admin/SeatBasedBilling/AddModeratorsModal')
);
import UserSelect, { UserOptionTypeBase } from 'components/UI/UserSelect';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';

// Hooks
import useExceedsSeats from 'hooks/useExceedsSeats';
import useDeleteProjectFolderModerator from 'api/project_folder_moderators/useDeleteProjectFolderModerator';
import useAddProjectFolderModerator from 'api/project_folder_moderators/useAddProjectFolderModerator';
import { getFullName } from 'utils/textUtils';

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const UserSelectSection = styled.section`
  display: flex;
  margin-bottom: 12px;
`;

const FolderPermissions = () => {
  const { projectFolderId } = useParams() as { projectFolderId: string };
  const { mutate: deleteFolderModerator, isLoading: deleteIsLoading } =
    useDeleteProjectFolderModerator();
  const { mutate: addFolderModerator, isLoading: addIsLoading } =
    useAddProjectFolderModerator();
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const { data: folderModerators } = useProjectFolderModerators({
    projectFolderId,
  });
  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] =
    useState<UserOptionTypeBase | null>(null);

  const exceedsSeats = useExceedsSeats()({
    newlyAddedModeratorsNumber: 1,
  });

  const closeModal = () => {
    setShowModal(false);
  };

  const handleOnChange = (user?: UserOptionTypeBase) => {
    setModeratorToAdd(user || null);
  };

  const handleOnAddFolderModeratorsClick = async () => {
    if (moderatorToAdd) {
      addFolderModerator(
        {
          projectFolderId,
          moderatorId: moderatorToAdd.id,
        },
        {
          onSuccess: () => {
            setModeratorToAdd(null);
          },
        }
      );
    }
  };

  const handleDeleteFolderModeratorClick = (moderatorId: string) => () => {
    deleteFolderModerator({ projectFolderId, id: moderatorId });
  };

  const handleAddClick = () => {
    const isSelectedUserAModerator =
      moderatorToAdd && !isRegularUser({ data: moderatorToAdd });
    const shouldOpenModal =
      hasSeatBasedBillingEnabled &&
      exceedsSeats.moderator &&
      !isSelectedUserAModerator;
    if (shouldOpenModal) {
      setShowModal(true);
    } else {
      handleOnAddFolderModeratorsClick();
    }
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
                selectedUserId={moderatorToAdd?.id || null}
                onChange={handleOnChange}
                placeholder={formatMessage(messages.searchFolderManager)}
                isNotFolderModeratorOfFolderId={projectFolderId}
              />
            </Box>
            <Button
              text={formatMessage(messages.addFolderManager)}
              buttonStyle="cl-blue"
              icon="plus-circle"
              padding="10px 16px"
              onClick={handleAddClick}
              disabled={!moderatorToAdd}
              processing={addIsLoading}
              ml="12px"
              data-cy="e2e-add-folder-moderator-button"
            />
          </Box>
          {hasSeatBasedBillingEnabled && (
            <Suspense fallback={null}>
              <AddModeratorsModal
                addModerators={handleOnAddFolderModeratorsClick}
                showModal={showModal}
                closeModal={closeModal}
              />
            </Suspense>
          )}
        </UserSelectSection>

        <List>
          <>
            {folderModerators &&
              folderModerators.data.map((folderModerator, index) => (
                // This row is a near copy of ModeratorListRow. They could be
                // extracted in 1 component.
                <Row
                  key={folderModerator.id}
                  isLastItem={index === folderModerators.data.length - 1}
                >
                  <Box display="flex" alignItems="center">
                    <Box mr="12px">
                      <Avatar userId={folderModerator.id} size={30} />
                    </Box>
                    <Text as="span" m="0">
                      {getFullName(folderModerator)}
                    </Text>
                  </Box>
                  <Text as="span" m="0">
                    {folderModerator.attributes.email}
                  </Text>
                  <Button
                    onClick={handleDeleteFolderModeratorClick(
                      folderModerator.id
                    )}
                    buttonStyle="text"
                    icon="delete"
                    processing={deleteIsLoading}
                  >
                    <FormattedMessage {...messages.deleteFolderManagerLabel} />
                  </Button>
                </Row>
              ))}
          </>
        </List>
      </Box>
      {!hasSeatBasedBillingEnabled && (
        <Box width="516px" py="32px">
          <SeatInfo seatType="moderator" />
        </Box>
      )}
    </Box>
  );
};

export default FolderPermissions;
