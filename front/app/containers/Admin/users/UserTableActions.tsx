// Libraries
import React, { FormEvent, useState } from 'react';
import { isArray, isNil, omitBy, includes } from 'lodash-es';
import { saveAs } from 'file-saver';

// Components
import Checkbox from 'components/UI/Checkbox';
import { Icon, Dropdown, Box } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';

// api
import { MembershipType } from 'api/groups/types';
import { IGroupMemberships } from 'api/group_memberships/types';
import useAddMembership from 'api/group_memberships/useAddMembership';
import useGroups from 'api/groups/useGroups';

// Utils
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';

// Events
import eventEmitter from 'utils/eventEmitter';
import events, { MembershipAdd } from './events';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// I18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

// Typings
import { CLErrorsWrapper } from 'typings';
import usersKeys from 'api/users/keys';
import { useQueryClient } from '@tanstack/react-query';

const StyledBox = styled(Box)`
  user-select: none;
`;

const UserCount = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 5px;
`;

const SelectAllCheckbox = styled(Checkbox)`
  flex: 0 1 auto;
  position: relative;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;

  &:hover,
  &:focus {
    background: ${rgba(colors.primary, 0.1)};
    color: ${colors.primary};
    outline: none;
  }
`;

const SelectAllCheckboxLabel = styled.span`
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  padding: 10px;
  padding-left: 0px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  margin-right: 10px;
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
`;

const DropdownListItemText = styled.div`
  width: 80%;
  flex: 1 1 auto;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: left;
  margin-right: 10px;
`;

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const DropdownListItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
  outline: none;
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.grey300};

    ${DropdownListItemText} {
      color: #000;
    }
  }
`;

const DropdownFooterButton = styled(Button)`
  .Button {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

interface Props {
  groupType?: MembershipType;
  selectedUsers: string[] | 'none' | 'all';
  toggleSelectAll: () => void;
  unselectAll: () => void;
  allUsersIds: string[];
  groupId?: string;
  deleteUsersFromGroup?: (userIds: string[]) => void;
  onSearch: (newValue: string) => void;
  usersDataLength: number;
}

const UserTableActions = ({
  toggleSelectAll,
  allUsersIds,
  selectedUsers,
  groupId,
  unselectAll,
  deleteUsersFromGroup,
  groupType,
  onSearch,
  usersDataLength,
}: Props) => {
  const queryClient = useQueryClient();
  const { formatDate, formatMessage } = useIntl();
  const { data: manualGroups } = useGroups({ membershipType: 'manual' });
  const { mutateAsync: addGroupMembership } = useAddMembership();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const showSelectAndExport = usersDataLength !== 0;

  const toggleAllUsers = () => {
    trackEventByName(tracks.toggleAllUsers.name);
    toggleSelectAll();
  };

  const exportUsers = async (event: FormEvent) => {
    event.preventDefault();
    const usersIds = selectedUsers === 'all' ? allUsersIds : selectedUsers;
    const apiPath = `${API_PATH}/users/as_xlsx`;
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const group = groupId;
    const users = isArray(usersIds) ? usersIds : null;
    const queryParameters = omitBy({ group, users }, isNil);
    const blob = await requestBlob(apiPath, fileType, queryParameters);
    saveAs(
      blob,
      `${formatMessage(messages.userExportFileName)}_${formatDate(
        Date.now()
      )}.xlsx`
    );
  };

  const toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedGroupIds([]);
    setDropdownOpened(!dropdownOpened);
  };

  const toggleGroup =
    (groupId: string) => (event: React.ChangeEvent | React.MouseEvent) => {
      event.preventDefault();

      if (!includes(selectedGroupIds, groupId)) {
        setSelectedGroupIds([...selectedGroupIds, groupId]);
      } else {
        setSelectedGroupIds(
          selectedGroupIds.filter(
            (selectedGroupId) => selectedGroupId !== groupId
          )
        );
      }
    };

  const addUsersToGroups = async () => {
    if (selectedGroupIds && selectedGroupIds.length > 0) {
      const usersIds = selectedUsers === 'all' ? allUsersIds : selectedUsers;
      const promises: Promise<IGroupMemberships | CLErrorsWrapper>[] = [];
      const timeout = (ms) => new Promise((res) => setTimeout(res, ms));
      const success = () => {
        eventEmitter.emit<MembershipAdd>(events.membershipAdd, {
          groupsIds: selectedGroupIds,
        });
        unselectAll();
        setDropdownOpened(false);
        setSelectedGroupIds([]);
        setProcessing(false);
      };
      const failed = () => {
        eventEmitter.emit<JSX.Element>(
          events.membershipAddFailed,
          <FormattedMessage {...messages.membershipAddFailed} />
        );
        setProcessing(false);
      };

      trackEventByName(tracks.addUsersToGroup.name, {
        extra: {
          usersIds,
          selectedGroupIds,
        },
      });

      if (isArray(usersIds)) {
        selectedGroupIds.forEach((groupId) => {
          usersIds.forEach((userId) => {
            promises.push(addGroupMembership({ groupId, userId }));
          });
        });
      }

      try {
        setProcessing(true);
        await Promise.all(promises);
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        await timeout(1000);
        success();
        return true;
      } catch (error) {
        trackEventByName(tracks.addedRedundantUserToGroup.name, {
          extra: {
            errorResponse: error,
          },
        });

        // if error because users already part of group(s)
        if (
          error?.errors?.user &&
          error.errors.user.filter((val) => val.error !== 'taken').length ===
            0 &&
          !error.errors.group
        ) {
          success();
          return true;
        } else {
          failed();
          throw error;
        }
      }
    }

    return;
  };

  const handleGroupsDeleteClick = () => {
    const usersIds = selectedUsers === 'all' ? allUsersIds : selectedUsers;

    if (Array.isArray(usersIds) && deleteUsersFromGroup) {
      deleteUsersFromGroup(usersIds);
    }
  };

  let selectedCount;

  if (selectedUsers === 'all') {
    selectedCount = allUsersIds.length;
  } else if (selectedUsers === 'none') {
    selectedCount = 0;
  } else {
    selectedCount = selectedUsers.length;
  }

  const exportType =
    selectedUsers === 'none' && !groupId
      ? 'exportAllUsers'
      : selectedUsers === 'none' && groupId
      ? 'exportGroup'
      : 'exportSelectedUsers';

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="space-between"
      borderBottom={`solid 1px ${colors.primary}`}
      mt="20px"
    >
      <StyledBox
        minHeight="60px"
        display="flex"
        alignItems="center"
        paddingBottom="15px"
        paddingLeft="5px"
        paddingRight="5px"
      >
        {showSelectAndExport && (
          <>
            <SelectAllCheckbox
              label={
                <SelectAllCheckboxLabel>
                  <FormattedMessage {...messages.select} />
                  {selectedCount > 0 && (
                    <UserCount className="e2e-selected-count">
                      ({selectedCount})
                    </UserCount>
                  )}
                </SelectAllCheckboxLabel>
              }
              checked={selectedUsers === 'all'}
              indeterminate={isArray(selectedUsers) && selectedUsers.length > 0}
              onChange={toggleAllUsers}
            />
            <ActionButtons>
              {selectedUsers !== 'none' && manualGroups && (
                <ActionButtonWrapper>
                  <Button
                    className="e2e-move-users"
                    onClick={toggleDropdown}
                    buttonStyle="admin-dark-text"
                  >
                    <StyledIcon name="folder-move" />
                    <FormattedMessage {...messages.moveUsersTableAction} />
                  </Button>

                  <Dropdown
                    width="300px"
                    top="45px"
                    left="0px"
                    opened={dropdownOpened}
                    onClickOutside={toggleDropdown}
                    content={
                      <DropdownList>
                        {manualGroups.data.map((group) => (
                          <DropdownListItem
                            key={group.id}
                            onClick={toggleGroup(group.id)}
                            className="e2e-dropdown-item"
                          >
                            <DropdownListItemText>
                              <T value={group.attributes.title_multiloc} />
                            </DropdownListItemText>
                            <Checkbox
                              checked={includes(selectedGroupIds, group.id)}
                              onChange={toggleGroup(group.id)}
                            />
                          </DropdownListItem>
                        ))}
                      </DropdownList>
                    }
                    footer={
                      <DropdownFooterButton
                        className="e2e-dropdown-submit"
                        buttonStyle="cl-blue"
                        onClick={addUsersToGroups}
                        processing={processing}
                        fullWidth={true}
                        padding="12px"
                        whiteSpace="normal"
                        disabled={
                          !selectedGroupIds || selectedGroupIds.length === 0
                        }
                      >
                        <FormattedMessage {...messages.moveUsersButton} />
                      </DropdownFooterButton>
                    }
                  />
                </ActionButtonWrapper>
              )}

              {groupType === 'manual' && selectedUsers !== 'none' && (
                <Button
                  onClick={handleGroupsDeleteClick}
                  className="hasLeftMargin"
                  buttonStyle="admin-dark-text"
                >
                  <StyledIcon name="delete" />
                  <FormattedMessage {...messages.membershipDelete} />
                </Button>
              )}

              <Button
                onClick={exportUsers}
                className={`export e2e-${exportType} hasLeftMargin`}
                buttonStyle="admin-dark-text"
              >
                <StyledIcon name="user-data" />
                <FormattedMessage {...messages[exportType]} />
              </Button>
            </ActionButtons>
          </>
        )}
      </StyledBox>
      <Box flex="0 0 250px">
        <SearchInput
          onChange={onSearch}
          a11y_numberOfSearchResults={usersDataLength}
        />
      </Box>
    </Box>
  );
};

export default UserTableActions;
