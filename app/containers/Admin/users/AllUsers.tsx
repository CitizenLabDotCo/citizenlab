// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'services/permissions/roles';
import * as moment from 'moment';

// Components
import Table from 'components/UI/Table';
import SortableTableHeaderCell from 'components/UI/Table/SortableTableHeaderCell';
import Avatar from 'components/Avatar';
import Toggle from 'components/UI/Toggle';
import Checkbox from 'components/UI/Checkbox';
import CustomPagination from 'components/admin/Pagination/CustomPagination';

// Services
import { IUserData } from 'services/users';

// Resources
import GetUsers, { GetUsersChildProps, SortAttribute } from 'resources/GetUsers';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

const StyledAvatar = styled(Avatar)`
  flex: 0 0 30px;
  height: 30px;
  margin-right: 15px;
  margin-left: 15px;
`;

const CustomPaginationWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

// Typings
interface InputProps {}

interface Props extends InputProps, GetUsersChildProps {}

interface State {}

class AllUsers extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  isUserAdmin = (user: IUserData) => {
    return isAdmin({ data: user });
  }

  handleAdminRoleOnChange = () => {
    return;
  }

  handleUserSelectedOnChange = () => {
    return;
  }

  handleSortingOnChange = (sortAttribute: SortAttribute) => () => {
    this.props.onChangeSorting(sortAttribute);
  }

  handlePaginationClick = (pageNumber: number) => {
    this.props.onChangePage(pageNumber);
  }

  render() {
    const { usersList, sortAttribute, sortDirection, currentPage, lastPage } = this.props;

    if (!isNilOrError(usersList) && usersList.length > 0) {
      return (
        <>
          <Table>
            <thead>
              <tr>
                <th />
                <th />
                <th className="sortable">
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.name} />}
                    onClick={this.handleSortingOnChange('last_name')}
                    sorted={sortAttribute === 'last_name' ? sortDirection : null}
                  />
                </th>
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.email} />}
                    onClick={this.handleSortingOnChange('email')}
                    sorted={sortAttribute === 'email' ? sortDirection : null}
                  />
                </th>
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.since} />}
                    onClick={this.handleSortingOnChange('created_at')}
                    sorted={sortAttribute === 'created_at' ? sortDirection : null}
                  />
                </th>
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.admin} />}
                    onClick={this.handleSortingOnChange('role')}
                    sorted={sortAttribute === 'role' ? sortDirection : null}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr key={user.id}>
                  <td><Checkbox value={false} onChange={this.handleUserSelectedOnChange} /></td>
                  <td><StyledAvatar userId={user.id} size="small" /></td>
                  <td>{user.attributes.first_name} {user.attributes.last_name}</td>
                  <td>{user.attributes.email}</td>
                  <td>{moment(user.attributes.created_at).format('LL')}</td>
                  <td><Toggle value={this.isUserAdmin(user)} onChange={this.handleAdminRoleOnChange} /></td>
                </tr>
              ))}
            </tbody>
          </Table>

          {lastPage && lastPage > 1 &&
            <CustomPaginationWrapper>
              <CustomPagination
                currentPage={currentPage || 1}
                totalPages={lastPage || 1}
                loadPage={this.handlePaginationClick}
              />
            </CustomPaginationWrapper>
          }
        </>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetUsers pageSize={5}>
    {users => <AllUsers {...inputProps} {...users} />}
  </GetUsers>
);
