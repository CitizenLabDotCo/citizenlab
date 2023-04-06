import React, { useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getExceededLimit } from 'components/SeatInfo/utils';

// services
import useProjectFolderModerators from 'hooks/useProjectFolderModerators';
import {
  addFolderModerator,
  deleteFolderModerator,
} from 'services/projectFolderModerators';
import { isCollaborator } from 'services/permissions/roles';

// i18n
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { IconTooltip, Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
const AddCollaboratorsModal = lazy(
  () => import('components/admin/AddCollaboratorsModal')
);
import UserSelect, { UserOptionTypeBase } from 'components/UI/UserSelect';
import SeatInfo from 'components/SeatInfo';

// Hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

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
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  const folderModerators = useProjectFolderModerators(projectFolderId);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] =
    useState<UserOptionTypeBase | null>(null);

  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const maximumCollaborators =
    appConfiguration?.data.attributes.settings.core.maximum_moderators_number;
  const additionalCollaborators =
    appConfiguration?.data.attributes.settings.core
      .additional_moderators_number;
  if (!appConfiguration || !seats) return null;

  const currentCollaboratorSeats =
    seats.data.attributes.project_moderators_number;

  const { hasReachedOrIsOverLimit } = getExceededLimit(
    hasSeatBasedBillingEnabled,
    currentCollaboratorSeats,
    additionalCollaborators,
    maximumCollaborators
  );

  const closeModal = () => {
    setShowModal(false);
  };

  const handleOnChange = (user?: UserOptionTypeBase) => {
    setModeratorToAdd(user || null);
  };

  const handleOnAddFolderModeratorsClick = async () => {
    if (moderatorToAdd) {
      setProcessing(true);
      await addFolderModerator(projectFolderId, moderatorToAdd.id);
      setProcessing(false);
      setModeratorToAdd(null);
    }
  };

  const handleDeleteFolderModeratorClick = (moderatorId: string) => () => {
    deleteFolderModerator(projectFolderId, moderatorId);
  };

  const handleAddClick = () => {
    const isSelectedUserAModerator =
      moderatorToAdd && isCollaborator({ data: moderatorToAdd });
    const shouldOpenModal =
      hasSeatBasedBillingEnabled &&
      hasReachedOrIsOverLimit &&
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
                hideAvatar
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
              processing={processing}
              ml="12px"
            />
          </Box>
          {hasSeatBasedBillingEnabled && (
            <Suspense fallback={null}>
              <AddCollaboratorsModal
                addModerators={handleOnAddFolderModeratorsClick}
                showModal={showModal}
                closeModal={closeModal}
              />
            </Suspense>
          )}
        </UserSelectSection>

        <List>
          <>
            {!isNilOrError(folderModerators) &&
              folderModerators.map((folderModerator, index) => (
                // This row is a near copy of ModeratorListRow. They could be
                // extracted in 1 component.
                <Row
                  key={folderModerator.id}
                  isLastItem={index === folderModerators.length - 1}
                >
                  <Box display="flex" alignItems="center">
                    <Box mr="12px">
                      <Avatar userId={folderModerator.id} size={30} />
                    </Box>
                    <Text as="span" m="0">
                      {`${folderModerator.attributes.first_name} ${folderModerator.attributes.last_name}`}
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
          <SeatInfo seatType="collaborator" />
        </Box>
      )}
    </Box>
  );
};

export default FolderPermissions;
