import React from 'react';
import { get } from 'lodash';
import FileSaver from 'file-saver';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';

// components
import { Table, Input, Popup, Button as SemanticButton } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import { FormattedDate } from 'react-intl';
import Avatar from 'components/Avatar';
import Toggle from 'components/UI/Toggle';
import Button from 'components/UI/Button';

// resources
import GetUsers, { GetUsersChildProps, SortAttribute } from 'utils/resourceLoaders/components/GetUsers';

// services
import { IUserData, IRole, updateUser, deleteUser } from 'services/users';

// i18n
import messages from './../messages';

// styling
import styled from 'styled-components';

const Container = styled.div`
  th::after {
    margin-top: -7px !important;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;

  .no-padding-right button {
    padding-right: 0;
  }
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  width: 32px;
  height: 32px;
  margin-right: 12px;
`;

interface InputProps {}

interface Props extends InputProps, GetUsersChildProps {}

type State = {
  exporting: boolean;
};

class UsersTable extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      exporting: false,
    };
  }

  handlePaginationClick = (newCurrentPageNumber: number) => {
    this.props.onChangePage(newCurrentPageNumber);
  }

  handleOnSort = (sortAttribute: SortAttribute) => () => {
    this.props.onChangeSorting(sortAttribute);
  }

  handleSearchOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onChangeSearchTerm(event.currentTarget.value);
  }

  handleOnDeleteUser = (userId: string) => () => {
    deleteUser(userId);
  }

  isAdmin = (roles: IRole[] | undefined) => {
    let isAdmin = false;

    if (roles && roles.length > 0) {
      roles.forEach((role) => {
        if (role.type === 'admin') {
          isAdmin = true;
        }
      });
    }

    return isAdmin;
  }

  handleOnAdminToggle = (user: IUserData) => () => {
    let newRoles: IRole[] = [];

    if (user.attributes.roles && this.isAdmin(user.attributes.roles)) {
      newRoles = user.attributes.roles.filter(role => role.type !== 'admin');
    } else {
      newRoles = [
        ...get(user, 'attributes.roles', []),
        { type: 'admin' }
      ];
    }

    updateUser(user.id, { roles: newRoles });
  }

  handleUserExport = async () => {
    try {
      this.setState({ exporting: true });
      const blob = await requestBlob(`${API_PATH}/users/as_xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      FileSaver.saveAs(blob, 'users-export.xlsx');
      this.setState({ exporting: false });
    } catch (error) {
      this.setState({ exporting: false });
    }
  }

  render () {
    const { exporting } = this.state;
    const { usersList, sortAttribute, sortDirection, currentPage, lastPage } = this.props;

    if (usersList) {
      return (
        <Container>
          <HeaderContainer>
            <Input icon="search" onChange={this.handleSearchOnChange} size="large" />

            <Button
              style="cl-blue"
              icon="download"
              onClick={this.handleUserExport}
              processing={exporting}
              circularCorners={false}
            >
              <FormattedMessage {...messages.exportUsers} />
            </Button>
          </HeaderContainer>

          <Table sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell sorted={sortAttribute === 'last_name' ? sortDirection : undefined} onClick={this.handleOnSort('last_name')}>
                  <FormattedMessage {...messages.name} />
                </Table.HeaderCell>
                <Table.HeaderCell sorted={sortAttribute === 'email' ? sortDirection : undefined} onClick={this.handleOnSort('email')}>
                  <FormattedMessage {...messages.email} />
                </Table.HeaderCell>
                <Table.HeaderCell sorted={sortAttribute === 'created_at' ? sortDirection : undefined} onClick={this.handleOnSort('created_at')}>
                  <FormattedMessage {...messages.member} />
                </Table.HeaderCell>
                <Table.HeaderCell textAlign="center" sorted={sortAttribute === 'role' ? sortDirection : undefined} onClick={this.handleOnSort('role')}>
                  <FormattedMessage {...messages.admin} />
                </Table.HeaderCell>
                <Table.HeaderCell textAlign="center">
                  <FormattedMessage {...messages.delete} />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {usersList.map((user) => {
                const firstName = user.attributes.first_name;
                const lastName = user.attributes.last_name;
                const createdAt = user.attributes.created_at;
                const email = user.attributes.email;
                const isAdmin = this.isAdmin(user.attributes.roles);

                return (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <UserCell>
                        <StyledAvatar size="small" userId={user.id} />
                        <span>{firstName} {lastName}</span>
                      </UserCell>
                    </Table.Cell>
                    <Table.Cell>
                      {email}
                    </Table.Cell>
                    <Table.Cell>
                      <FormattedDate value={createdAt} />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Toggle value={isAdmin} onChange={this.handleOnAdminToggle(user)} />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Popup
                        trigger={<SemanticButton icon="trash" />}
                        content={<SemanticButton color="red" content={<FormattedMessage {...messages.deleteUser} />} onClick={this.handleOnDeleteUser(user.id)} />}
                        on="click"
                        position="bottom right"
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>

            {(currentPage && lastPage && lastPage > 1) &&
            <Table.Footer fullWidth={true}>
              <Table.Row>
                <Table.HeaderCell colSpan="6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    loadPage={this.handlePaginationClick}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
            }
          </Table>
        </Container>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetUsers>
    {users => <UsersTable {...inputProps} {...users} />}
  </GetUsers>
);
