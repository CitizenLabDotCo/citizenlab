import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import AsyncSelect from 'react-select/async';
import { first } from 'rxjs/operators';
import { IOption } from 'typings';
import {
  isProjectFolderModerator,
  userModeratesFolder,
} from 'services/permissions/rules/projectFolderPermissions';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
// utils
import { isNilOrError, isNonEmptyString } from 'utils/helperUtils';

// services
import useProjectFolderModerators from 'hooks/useProjectFolderModerators';
import { IUsers, IUserData, usersStream } from 'services/users';
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
import selectStyles from 'components/UI/MultipleSelect/styles';
import { isAdmin } from 'services/permissions/roles';
import AddCollaboratorsModal from 'components/admin/AddCollaboratorsModal';
import SeatInfo from 'components/SeatInfo';

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const UserSelectSection = styled.section`
  display: flex;
  margin-bottom: 12px;
`;

const UserSelectSelect = styled(AsyncSelect)`
  min-width: 300px;
`;

const UserSelectButton = styled(Button)`
  margin-left: 12px;
`;

const FolderPermissions = () => {
  const { projectFolderId } = useParams() as { projectFolderId: string };
  const { formatMessage } = useIntl();
  const folderModerators = useProjectFolderModerators(projectFolderId);
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  const [selectedUserOptions, setSelectedUserOptions] = useState<IOption[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };

  const handleFolderModeratorInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleFolderModeratorsChange = async (selection: IOption[]) => {
    setSelectedUserOptions(selection);
  };

  const handleOnAddFolderModeratorsClick = useCallback(() => {
    setProcessing(true);
    selectedUserOptions.forEach(({ value: userId }) =>
      addFolderModerator(projectFolderId, userId)
    );
    setProcessing(false);
    setSelectedUserOptions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserOptions]);

  const handleDeleteFolderModeratorClick = (moderatorId: string) => () => {
    deleteFolderModerator(projectFolderId, moderatorId);
  };

  const loadUsers = (inputValue: string, callback) => {
    if (inputValue) {
      setLoading(true);

      usersStream({
        queryParameters: {
          search: inputValue,
        },
      })
        .observable.pipe(first())
        .subscribe((response) => {
          setLoading(false);
          callback(getFolderModeratorOptions(response));
        });
    }
  };

  const getFolderModeratorOptions = (users: IUsers) => {
    // note: this typing info of users above is not correc
    if (!isNilOrError(users)) {
      return users.data
        .filter(
          (user: IUserData) => !userModeratesFolder(user, projectFolderId)
        )
        .map((user: IUserData) => {
          return {
            value: user.id,
            label: `${userName(user)} (${user.attributes.email})`,
            email: `${user.attributes.email}`,
            disabled:
              isProjectFolderModerator(user) && !isAdmin({ data: user }),
          };
        });
    }

    return [];
  };

  const noOptionsMessage = () => {
    if (isNonEmptyString(searchInput)) {
      return formatMessage(messages.noMatch);
    }

    return null;
  };

  const isDropdownIconHidden = useMemo(
    () => !isNonEmptyString(searchInput),
    [searchInput]
  );

  const userName = (user: IUserData) => {
    return `${user.attributes.first_name} ${user.attributes.last_name}`;
  };

  const handleAddClick = () => {
    if (hasSeatBasedBillingEnabled) {
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
          <UserSelectSelect
            name="search-user"
            isMulti={true}
            cacheOptions={false}
            defaultOptions={false}
            loadOptions={loadUsers}
            isLoading={loading}
            isDisabled={processing}
            value={selectedUserOptions}
            onChange={handleFolderModeratorsChange}
            placeholder={formatMessage(messages.searchFolderManager)}
            styles={selectStyles}
            noOptionsMessage={noOptionsMessage}
            onInputChange={handleFolderModeratorInputChange}
            components={
              isDropdownIconHidden && { DropdownIndicator: () => null }
            }
          />
          <UserSelectButton
            text={formatMessage(messages.addFolderManager)}
            buttonStyle="cl-blue"
            icon="plus-circle"
            padding="13px 16px"
            onClick={handleAddClick}
            disabled={!selectedUserOptions || selectedUserOptions.length === 0}
            processing={processing}
          />
          {hasSeatBasedBillingEnabled && (
            <AddCollaboratorsModal
              addModerators={handleOnAddFolderModeratorsClick}
              showModal={showModal}
              closeModal={closeModal}
              noOfCollaboratorSeatsToAdd={selectedUserOptions.length}
            />
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
                      {userName(folderModerator)}
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
