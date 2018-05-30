// Libraries
import React from 'react';
import { isArray, includes } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';

// Components
import Checkbox from 'components/UI/Checkbox';
import Dropdown from 'components/UI/Dropdown';
import T from 'components/T';

// Services
import { deleteUser } from 'services/users';
import { addGroupMembership } from 'services/groupMemberships';

// Resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// I18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken, rgba } from 'polished';

const TableOptions = styled.div`
  display: flex;
  padding-bottom: 12px;
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 30px;
  border-bottom: solid 1px #eaeaea;
  user-select: none;
`;

const SelectAllLabel = styled.span`
  display: flex;
`;

const UserCount = styled.span`
  color: ${colors.label};
  font-weight: 300;
  margin-left: 7px;
`;

const ActionButton = styled.div`
  margin-left: 30px;
  position: relative;
  cursor: pointer;
`;

const Group = styled.div`

`;

const AddToGroupButton = styled.div`
  width: 100%;
  color: ${(props) => props.theme.colors.label};
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: ${props => rgba(props.theme.colors.label, 0.12)};
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colors.label)};
    background: ${props => rgba(props.theme.colors.label, 0.22)};
    text-decoration: none;
  }
`;

// Typings
interface InputProps {
  selectedUsers: string[] | 'none' | 'all';
  userCount: number;
  toggleSelectAll: () => void;
}

interface DataProps {
  groups: GetGroupsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  addToGroupDropdownOpened: boolean;
  selectedGroups: string[];
}

class UserTableActions extends React.PureComponent<Props & InjectedIntlProps, State> {

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

  toggleMoveDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState(({ addToGroupDropdownOpened }) => ({ addToGroupDropdownOpened: !addToGroupDropdownOpened }));
  }

  toggleGroup = (groupId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    this.setState(({ selectedGroups }) => ({
      selectedGroups: includes(selectedGroups, groupId) ? selectedGroups.filter(item => item !== groupId) : [...selectedGroups, groupId]
    }));
  }

  addUsersToGroups = (event: React.FormEvent<any>) => {
    event.preventDefault();
    const { selectedUsers } = this.props;
    const { selectedGroups } = this.state;

    if (isArray(selectedUsers)) {
      selectedGroups.forEach((groupId) => {
        selectedUsers.forEach((userId) => {
          addGroupMembership(groupId, userId);
        });
      });
    }
  }

  deleteUsers = (event: React.FormEvent<any>) => {
    event.preventDefault();
    const { selectedUsers } = this.props;

    if (isArray(selectedUsers)) {
      const message = this.props.intl.formatMessage(messages.deleteSelectedUsersConfirmation);

      if (window.confirm(message)) {
        selectedUsers.forEach((userId) => {
          deleteUser(userId);
        });
      }
    }
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

  render() {
    const { selectedUsers, userCount } = this.props;
    const { groupsList } = this.props.groups;
    const { addToGroupDropdownOpened, selectedGroups } = this.state;

    return (
      <TableOptions>
        <Checkbox
          label={
            <SelectAllLabel>
              <FormattedMessage {...messages.selectAll} />
              <UserCount>(<FormattedMessage {...messages.xUsers} values={{ count: userCount }} />)</UserCount>
            </SelectAllLabel>
          }
          value={(selectedUsers === 'all')}
          onChange={this.toggleAllUsers}
        />

        {selectedUsers && isArray(selectedUsers) && !isNilOrError(groupsList) &&
          <ActionButton onClick={this.toggleMoveDropdown}>
            <FormattedMessage {...messages.moveUsers} />

            <Dropdown
              opened={addToGroupDropdownOpened}
              content={(
                <>
                  {groupsList.map((group) => (
                    <Group key={group.id}>
                      <T value={group.attributes.title_multiloc} />

                      <Checkbox
                        label={<T value={group.attributes.title_multiloc} />}
                        value={includes(selectedGroups, group.id)}
                        onChange={this.toggleGroup(group.id)}
                      />
                    </Group>
                  ))}
                </>
              )}
              footer={(
                <AddToGroupButton onClick={this.addUsersToGroups}>
                  <FormattedMessage {...messages.add} />
                </AddToGroupButton>
              )}
              toggleOpened={this.toggleMoveDropdown}
            />
          </ActionButton>
        }

        {selectedUsers && isArray(selectedUsers) &&
          <ActionButton onClick={this.deleteUsers}>
            <FormattedMessage {...messages.deleteButton} />
          </ActionButton>
        }

        <ActionButton onClick={this.exportUsers}>
          <FormattedMessage {...messages.exportUsers} />
        </ActionButton>
      </TableOptions>
    );
  }
}

const UserTableActionsWithHoCs = injectIntl<Props>(UserTableActions);

export default (inputProps: InputProps) => (
  <GetGroups {...inputProps}>
    {groups => <UserTableActionsWithHoCs {...inputProps} groups={groups} />}
  </GetGroups>
);
