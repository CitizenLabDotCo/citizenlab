// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isArray, isNil, omitBy } from 'lodash';
import FileSaver from 'file-saver';

// Components
import Checkbox from 'components/UI/Checkbox';
import MultipleSelectDropdown from 'components/admin/MultipleSelectDropdown';
import Icon from 'components/UI/Icon';

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
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 15px;
  border-bottom: solid 1px #eaeaea;
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

const StyledMultipleSelectDropdown = styled(MultipleSelectDropdown)`
  margin-right: 40px;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 20px;
  height: 20px;
`;

// Typings
import { API } from 'typings';

interface InputProps {
  groupType?: MembershipType;
  selectedUsers: string[] | 'none' | 'all';
  toggleSelectAll: () => void;
  allUsersIds: string[];
  groupId?: string;
  deleteUsersFromGroup?: (userIds: string[]) => void;
}

interface DataProps {
  manualGroups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
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
      FileSaver.saveAs(blob, 'users-export.xlsx');
    } catch (error) {
      throw error;
    }
  }

  getchoices = (groupsList: IGroupData[]) => {
    return groupsList.map((group) => ({ text: group.attributes.title_multiloc, id: group.id }));
  }

  addUsersToGroups = async (groupsIds) => {
    const { allUsersIds, selectedUsers, trackAddUsersToGroups, trackAddedRedundantUserToGroup } = this.props;
    const usersIds = (selectedUsers === 'all') ? allUsersIds : selectedUsers;
    const promises: Promise<IGroupMembership | API.ErrorResponse>[] = [];
    const timeout = ms => new Promise(res => setTimeout(res, ms));

    trackAddUsersToGroups({
      extra: {
        usersIds,
        groupsIds,
      }
    });

    if (isArray(usersIds)) {
      groupsIds.forEach((groupId) => {
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
      this.setState({ processing: false });
      return true;
    } catch (error) {
      trackAddedRedundantUserToGroup({
        extra: {
          errorResponse: error
        }
      });

      if (error && error.json && error.json.errors.user.filter(val => val.error !== 'taken').length === 0 && !error.json.errors.group) {
        await streams.fetchAllStreamsWithEndpoint(`${API_PATH}/groups`);
        this.setState({ processing: false });
        return true;
      } else {
        this.setState({ processing: false });
        throw error;
      }
    }
  }

  handleGroupsDeleteClick = () => {
    const { deleteUsersFromGroup, selectedUsers, allUsersIds } = this.props;
    const usersIds = (selectedUsers === 'all') ? allUsersIds : selectedUsers;

    if (Array.isArray(usersIds) && deleteUsersFromGroup) {
      deleteUsersFromGroup(usersIds);
    }
  }

  emitMembershipAddSuccess = (groupsIds) => (
    eventEmitter.emit<MembershipAdd>('usersAdmin', events.membershipAdd, { groupsIds })
  )

  emitMembershipAddError = () => (
    eventEmitter.emit<JSX.Element>('usersAdmin', events.membershipAddFailed, <FormattedMessage {...messages.membershipAddFailed} />)
  )

  render() {
    const { selectedUsers, groupType, groupId, allUsersIds } = this.props;
    const { processing } = this.state;
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
          <StyledMultipleSelectDropdown
            choices={this.getchoices(groupsList)}
            dropdownFooterMessage={messages.dropdownFooterMessage}
            onSubmit={this.addUsersToGroups}
            processing={processing}
            emitSuccess={this.emitMembershipAddSuccess}
            emitError={this.emitMembershipAddError}
          >
            <ActionButton className="e2e-move-users noRightMargin">
              <StyledIcon name="moveFolder" />
              <FormattedMessage {...messages.moveUsers} />
            </ActionButton>
          </StyledMultipleSelectDropdown>
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
