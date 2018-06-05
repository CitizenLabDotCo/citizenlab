// Libraries
import React from 'react';
import { isArray } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';

// Components
import Checkbox from 'components/UI/Checkbox';
import MultipleSelectDropdown from 'components/admin/MultipleSelectDropdown';
import Icon from 'components/UI/Icon';

// Services
import { addGroupMembership } from 'services/groupMemberships';

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
  display: flex;
  align-items: center;
  padding-bottom: 30px;
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 30px;
  border-bottom: solid 1px #eaeaea;
  user-select: none;
`;

const UserCount = styled.span`
  color: ${colors.label};
  font-weight: 300;
  margin-left: 7px;
`;

const ActionButton = styled.button`
  margin-right: 30px;
  position: relative;
  padding: 5px;
  border-radius: 5px;
  .cl-icon {
    margin-right: 10px;
  }

  &:hover,
  &:focus {
    background: ${rgba(colors.adminTextColor, .1)};
    color: ${colors.adminTextColor};
    outline: none;
  }
`;


// Typings
import { IGroupData } from 'services/groups';

interface InputProps {
  groupType?: MembershipType;
  selectedUsers: string[] | 'none' | 'all';
  toggleSelectAll: () => void;
  allUsersIds: string[];
  deleteUsersFromGroup?: () => void;
}

interface DataProps {
  manualGroups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class UserTableActions extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      addToGroupDropdownOpened: false,
      selectedGroups: []
    };
  }

  toggleAllUsers = () => {
    this.props.toggleSelectAll();
  }


  exportUsers = (event: React.FormEvent<any>) => {
    event.preventDefault();

    // const { selectedUsers } = this.props;

    // try {
    //   this.setState({ exporting: true });
    //   const blob = await requestBlob(`${API_PATH}/users/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //   FileSaver.saveAs(blob, 'users-export.xlsx');
    //   this.setState({ exporting: false });
    // } catch (error) {
    //   this.setState({ exporting: false });
    // }
  }

  getchoices = (groupsList: IGroupData[]) => {
    return groupsList.map((group) => ({ text: group.attributes.title_multiloc, id: group.id }));
  }

  addUsersToGroups = (groupsIds) => {
    const { allUsersIds, selectedUsers } = this.props;
    const usersIds = (selectedUsers === 'all') ? allUsersIds : selectedUsers;
    const array: Promise<any>[] = [];
    if (isArray(usersIds)) {
      groupsIds.forEach((groupId) => {
        usersIds.forEach((userId) => {
          array.push(addGroupMembership(groupId, userId));
        });
      });
    }
    return Promise.all(array);
  }

  render() {
    const { selectedUsers, deleteUsersFromGroup, groupType, allUsersIds } = this.props;
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
                <FormattedMessage {...messages.selectAll} />
                <UserCount>(<FormattedMessage
                  {...messages.xUsers}
                  values={{
                    count: selectedCount,
                  }}
                />)</UserCount>
              </>
            }
            value={(selectedUsers === 'all')}
            onChange={this.toggleAllUsers}
          />
        </ActionButton>

        {selectedUsers !== 'none' && !isNilOrError(groupsList) &&
          <MultipleSelectDropdown
            choices={this.getchoices(groupsList)}
            messages={messages}
            onSubmit={this.addUsersToGroups}
          >
            <ActionButton>
              <Icon name="moveFolder"/>
              <FormattedMessage {...messages.moveUsers} />
            </ActionButton>
          </MultipleSelectDropdown>
        }

        {groupType === 'manual' && selectedUsers !== 'none' &&
          <ActionButton onClick={deleteUsersFromGroup}>
            <Icon name="trash"/>
            <FormattedMessage {...messages.deleteFromGroupButton} />
          </ActionButton>
        }

        <ActionButton onClick={this.exportUsers}>
          <Icon name="userExport"/>
          <FormattedMessage {...messages.exportUsers} />
        </ActionButton>
      </TableOptions>
    );
  }
}


export default (inputProps: InputProps) => (
  <GetGroups membershipType="manual">
    {manualGroups => <UserTableActions {...inputProps} manualGroups={manualGroups} />}
  </GetGroups>
);
