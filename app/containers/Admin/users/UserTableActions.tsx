// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isArray, isNil, omitBy, includes } from 'lodash-es';
import { saveAs } from 'file-saver';

// Components
import Checkbox from 'components/UI/Checkbox';
import Dropdown from 'components/UI/Dropdown';
import Icon from 'components/UI/Icon';
import T from 'components/T';
import Button from 'components/UI/Button';

// Services
import { IGroupData } from 'services/groups';
import { addGroupMembership, IGroupMembership } from 'services/groupMemberships';

// Utils
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

// Events
import eventEmitter from 'utils/eventEmitter';
import events, { MembershipAdd } from './events';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Resources
import GetGroups, { GetGroupsChildProps, MembershipType } from 'resources/GetGroups';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

const TableOptions = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  padding-left: 5px;
  padding-right: 5px;
  margin-bottom: 15px;
  border-bottom: solid 1px ${colors.separation};
  user-select: none;
`;

const UserCount = styled.span`
  color: ${colors.label};
  font-weight: 300;
  margin-left: 7px;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  margin-right: 40px;
  position: relative;
  padding: 5px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;

  span {
    text-align: left;
  }

  &.noRightMargin {
    margin-right: 0px;
  }

  .cl-icon {
    margin-right: 8px;
  }

  &:hover,
  &:focus {
    background: ${rgba(colors.adminTextColor, .1)};
    color: ${colors.adminTextColor};
    outline: none;
  }
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 20px;
  height: 20px;
`;

const ActionButtonWrapper = styled.div`
  position: relative;
  margin-right: 40px;
  display: flex;
  flex-direction: column;
`;

const DropdownWrapper = styled.div`
  width: 100%;
  flex: 0 0 0px;
  position: relative;
  display: flex;
  justify-content: center;
`;

const DropdownListItemText = styled.div`
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

const DropdownListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.clDropdownHoverBackground};

    ${DropdownListItemText} {
      color: #000;
    }
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`;

const DropdownFooterButton = styled(Button)`
  .Button {
    padding: 12px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

// Typings
import { CLErrorsJSON } from 'typings';

interface InputProps {
  groupType?: MembershipType;
  selectedUsers: string[] | 'none' | 'all';
  toggleSelectAll: () => void;
  unselectAll: () => void;
  allUsersIds: string[];
  groupId?: string;
  deleteUsersFromGroup?: (userIds: string[]) => void;
}

interface DataProps {
  manualGroups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  dropdownOpened: boolean;
  selectedGroupIds: string[];
  processing: boolean;
}

interface Tracks {
  trackToggleAllUsers: Function;
  trackAddUsersToGroups: Function;
  trackAddedRedundantUserToGroup: Function;
}

class UserTableActions extends PureComponent<Props & Tracks, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
      selectedGroupIds: [],
      processing: false
    };
  }

  toggleAllUsers = () => {
    this.props.trackToggleAllUsers();
    this.props.toggleSelectAll();
  }

  exportUsers = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { allUsersIds, selectedUsers, groupId } = this.props;
      const usersIds = (selectedUsers === 'all' ? allUsersIds : selectedUsers);
      const apiPath = `${API_PATH}/users/as_xlsx`;
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const group = groupId;
      const users = (isArray(usersIds) ? usersIds : null);
      const queryParameters = omitBy({ group, users }, isNil);
      const blob = await requestBlob(apiPath, fileType, queryParameters);
      saveAs(blob, 'users-export.xlsx');
    } catch (error) {
      throw error;
    }
  }

  getchoices = (groupsList: IGroupData[]) => {
    return groupsList.map((group) => ({ text: group.attributes.title_multiloc, id: group.id }));
  }

  toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState(({ dropdownOpened }) => ({
      selectedGroupIds: [],
      dropdownOpened: !dropdownOpened
    }));
  }

  toggleGroup = (groupId: string) => () => {
    const { selectedGroupIds } = this.state;

    if (!includes(selectedGroupIds, groupId)) {
      this.setState({ selectedGroupIds: [...this.state.selectedGroupIds, groupId] });
    } else {
      this.setState({
        selectedGroupIds: selectedGroupIds.filter((selectedGroupId) => selectedGroupId !== groupId)
      });
    }
  }

  addUsersToGroups = async () => {
    const { selectedGroupIds } = this.state;

    if (selectedGroupIds && selectedGroupIds.length > 0) {
      const { allUsersIds, selectedUsers, trackAddUsersToGroups, trackAddedRedundantUserToGroup } = this.props;
      const usersIds = (selectedUsers === 'all') ? allUsersIds : selectedUsers;
      const promises: Promise<IGroupMembership | CLErrorsJSON>[] = [];
      const timeout = ms => new Promise(res => setTimeout(res, ms));
      const success = () => {
        eventEmitter.emit<MembershipAdd>('usersAdmin', events.membershipAdd, { groupsIds: selectedGroupIds });
        this.props.unselectAll();
        this.setState({ selectedGroupIds: [], processing: false, dropdownOpened: false });
      };
      const failed = () => {
        eventEmitter.emit<JSX.Element>('usersAdmin', events.membershipAddFailed, <FormattedMessage {...messages.membershipAddFailed} />);
        this.setState({ processing: false });
      };

      trackAddUsersToGroups({
        extra: {
          usersIds,
          selectedGroupIds,
        }
      });

      if (isArray(usersIds)) {
        selectedGroupIds.forEach((groupId) => {
          usersIds.forEach((userId) => {
            promises.push(addGroupMembership(groupId, userId));
          });
        });
      }

      try {
        this.setState({ processing: true });
        await Promise.all(promises);
        await timeout(1000);
        await streams.fetchAllStreamsWithEndpoint(`${API_PATH}/groups`);
        success();
        return true;
      } catch (error) {
        trackAddedRedundantUserToGroup({
          extra: {
            errorResponse: error
          }
        });

        // if error because users already part of group(s)
        if (error && error.json && error.json.errors.user.filter(val => val.error !== 'taken').length === 0 && !error.json.errors.group) {
          await streams.fetchAllStreamsWithEndpoint(`${API_PATH}/groups`);
          success();
          return true;
        } else {
          failed();
          throw error;
        }
      }
    }

    return;
  }

  handleGroupsDeleteClick = () => {
    const { deleteUsersFromGroup, selectedUsers, allUsersIds } = this.props;
    const usersIds = (selectedUsers === 'all') ? allUsersIds : selectedUsers;

    if (Array.isArray(usersIds) && deleteUsersFromGroup) {
      deleteUsersFromGroup(usersIds);
    }
  }

  render() {
    const { selectedUsers, groupType, groupId, allUsersIds } = this.props;
    const { dropdownOpened, selectedGroupIds, processing } = this.state;
    const { groupsList } = this.props.manualGroups;

    let selectedCount;

    if (selectedUsers === 'all') {
      selectedCount = allUsersIds.length;
    } else if (selectedUsers === 'none') {
      selectedCount = 0;
    } else {
      selectedCount = selectedUsers.length;
    }

    return (
      <TableOptions>
        <ActionButton onClick={this.toggleAllUsers}>
          <Checkbox
            label={
              <>
                <FormattedMessage {...messages.select} />
                <UserCount>
                  (<FormattedMessage
                    {...messages.userCount}
                    values={{
                      count: selectedCount,
                    }}
                  />)
                </UserCount>
              </>
            }
            value={(selectedUsers === 'all')}
            onChange={this.toggleAllUsers}
          />
        </ActionButton>

        {selectedUsers !== 'none' && !isNilOrError(groupsList) &&
          <ActionButtonWrapper>
            <ActionButton className="e2e-move-users noRightMargin" onClick={this.toggleDropdown}>
              <StyledIcon name="moveFolder" />
              <FormattedMessage {...messages.moveUsers} />
            </ActionButton>

            <DropdownWrapper>
              <Dropdown
                top="10px"
                opened={dropdownOpened}
                onClickOutside={this.toggleDropdown}
                content={(
                  <>
                    {groupsList.map((group) => (
                      <DropdownListItem
                        key={group.id}
                        onClick={this.toggleGroup(group.id)}
                        className="e2e-dropdown-item"
                      >
                        <DropdownListItemText>
                          <T value={group.attributes.title_multiloc} />
                        </DropdownListItemText>
                        <StyledCheckbox
                          value={includes(selectedGroupIds, group.id)}
                          onChange={this.toggleGroup(group.id)}
                        />
                      </DropdownListItem>
                    ))}
                  </>
                )}
                footer={(
                  <DropdownFooterButton
                    className="e2e-dropdown-submit"
                    style="cl-blue"
                    onClick={this.addUsersToGroups}
                    processing={processing}
                    fullWidth={true}
                    disabled={!selectedGroupIds || selectedGroupIds.length === 0}
                  >
                    <FormattedMessage {...messages.moveUsers} />
                  </DropdownFooterButton>
                )}
              >
                <ActionButton className="e2e-move-users noRightMargin">
                  <StyledIcon name="moveFolder" />
                  <FormattedMessage {...messages.moveUsers} />
                </ActionButton>
              </Dropdown>
            </DropdownWrapper>
          </ActionButtonWrapper>
        }

        {groupType === 'manual' && selectedUsers !== 'none' &&
          <ActionButton onClick={this.handleGroupsDeleteClick}>
            <StyledIcon name="trash" />
            <FormattedMessage {...messages.membershipDelete} />
          </ActionButton>
        }

        <ActionButton onClick={this.exportUsers} className="export">
          <StyledIcon name="userExport" />
          {selectedUsers === 'none' && !groupId && <FormattedMessage {...messages.exportAllUsers} />}
          {selectedUsers === 'none' && groupId && <FormattedMessage {...messages.exportGroup} />}
          {selectedUsers !== 'none' && <FormattedMessage {...messages.exportSelectedUsers} />}
        </ActionButton>
      </TableOptions>
    );
  }
}

const UserTableActionsWithHocs = injectTracks<Props>({
  trackToggleAllUsers: tracks.toggleAllUsers,
  trackAddUsersToGroups: tracks.addUsersToGroup,
  trackAddedRedundantUserToGroup: tracks.addedRedundantUserToGroup,
})(UserTableActions);

export default (inputProps: InputProps) => (
  <GetGroups membershipType="manual">
    {manualGroups => <UserTableActionsWithHocs {...inputProps} manualGroups={manualGroups} />}
  </GetGroups>
);
