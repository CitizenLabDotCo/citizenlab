import React, { FormEvent, useState } from 'react';

import {
  Dropdown,
  Box,
  colors,
  fontSizes,
  Divider,
} from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import { isArray, isNil, omitBy, includes } from 'lodash-es';
import { rgba } from 'polished';
import styled from 'styled-components';
import { CLErrorsWrapper } from 'typings';

import { IGroupMemberships } from 'api/group_memberships/types';
import useAddMembership from 'api/group_memberships/useAddMembership';
import { MembershipType } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';
import usersKeys from 'api/users/keys';

import { API_PATH } from 'containers/App/constants';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Checkbox from 'components/UI/Checkbox';
import SearchInput from 'components/UI/SearchInput';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { requestBlob } from 'utils/requestBlob';

import events, { MembershipAdd } from './events';
import messages from './messages';
import tracks from './tracks';

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

const DropdownFooterButton = styled(ButtonWithLink)`
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
    trackEventByName(tracks.toggleAllUsers);
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

      trackEventByName(tracks.addUsersToGroup, {
        usersIds: usersIds.toString(),
        selectedGroupIds: selectedGroupIds.toString(),
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
        trackEventByName(tracks.addedRedundantUserToGroup, {
          errorResponse: error.toString(),
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
    <Box>
      <Box width="100%" display="flex" justifyContent="flex-end">
        <Box display="flex" alignItems="center">
          {showSelectAndExport && (
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
          )}
        </Box>
        {showSelectAndExport && (
          <>
            <ButtonWithLink
              ml="auto"
              onClick={exportUsers}
              className={`export e2e-${exportType} hasLeftMargin intercom-users-export-users-button`}
              buttonStyle="admin-dark-text"
              whiteSpace="wrap"
              icon="user-data"
              iconColor={colors.textPrimary}
              fontSize={`${fontSizes.s}px`}
            >
              <FormattedMessage {...messages[exportType]} />
            </ButtonWithLink>
            {selectedUsers !== 'none' && manualGroups && (
              <ActionButtonWrapper>
                <ButtonWithLink
                  className="e2e-move-users"
                  onClick={toggleDropdown}
                  buttonStyle="admin-dark-text"
                  whiteSpace="wrap"
                  icon="folder-move"
                  iconColor={colors.textPrimary}
                  fontSize={`${fontSizes.s}px`}
                >
                  <FormattedMessage {...messages.moveUsersTableAction} />
                </ButtonWithLink>

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
                      buttonStyle="admin-dark"
                      onClick={addUsersToGroups}
                      processing={processing}
                      fullWidth={true}
                      padding="12px"
                      whiteSpace="normal"
                      disabled={
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
              <ButtonWithLink
                onClick={handleGroupsDeleteClick}
                className="hasLeftMargin"
                buttonStyle="admin-dark-text"
                whiteSpace="wrap"
                icon="delete"
                iconColor={colors.textPrimary}
                fontSize={`${fontSizes.s}px`}
              >
                <FormattedMessage {...messages.membershipDelete} />
              </ButtonWithLink>
            )}
          </>
        )}
        <SearchInput
          onChange={onSearch}
          a11y_numberOfSearchResults={usersDataLength}
        />
      </Box>
      <Divider />
    </Box>
  );
};

export default UserTableActions;
