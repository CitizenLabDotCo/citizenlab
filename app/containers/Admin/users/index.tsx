import * as React from 'react';
import { omitBy, isNil, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

import FileSaver from 'file-saver';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';

// components
import { Table, Input, Popup, Button as SemanticButton } from 'semantic-ui-react';
import { FormattedMessage } from 'utils/cl-intl';
import Pagination from 'components/admin/Pagination';
import PageWrapper from 'components/admin/PageWrapper';
import { FormattedDate } from 'react-intl';
import Avatar from 'components/Avatar';
import Toggle from 'components/UI/Toggle';
import Button from 'components/UI/Button';

// utils
import { getPageNumberFromUrl } from 'utils/paginationUtils';

// services
import { usersStream, deleteUser, updateUser, IUsers, IUserData, IRole } from 'services/users';

// i18n
import messages from './messages';

// styling
import styled from 'styled-components';

const Container  = styled.div`
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

const HeaderTitle = styled.h1`
  color: #333;
  font-size: 35px;
  line-height: 40px;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  width: 34px;
  height: 34px;
  margin-right: 10px;
`;

interface ISort {
  property: string | undefined;
  direction: 'ascending' | 'descending' | undefined;
}

type Props = {};

type State = {
  users: IUsers | null;
  searchValue: string | null;
  sortProperty: string | undefined;
  sortDirection: 'ascending' | 'descending' | undefined;
  currentPageNumber: number;
  lastPageNumber: number | null;
  exporting: boolean;
};

export default class UsersTable extends React.PureComponent<Props, State> {
  searchValue$: Rx.BehaviorSubject<string | null>;
  sort$: Rx.BehaviorSubject<ISort | null>;
  currentPageNumber$: Rx.BehaviorSubject<number>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      users: null,
      sortProperty: undefined,
      sortDirection: undefined,
      currentPageNumber: 1,
      lastPageNumber: null,
      searchValue: null,
      exporting: false
    };
    this.searchValue$ = new Rx.BehaviorSubject(null);
    this.sort$ = new Rx.BehaviorSubject(null);
    this.currentPageNumber$ = new Rx.BehaviorSubject(1);
    this.subscriptions = [];
  }

  componentDidMount() {
    const { searchValue, sortProperty, sortDirection, currentPageNumber } = this.state;

    this.searchValue$.next(searchValue);
    this.sort$.next({ property: sortProperty, direction: sortDirection });
    this.currentPageNumber$.next(currentPageNumber);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        Rx.Observable.combineLatest(
          this.searchValue$,
          this.sort$,
        ).do(() => {
          this.currentPageNumber$.next(1);
        }),
        this.currentPageNumber$.distinctUntilChanged()
      ).switchMap(([[searchValue, sort], currentPageNumber]) => {
        const queryParameters = omitBy({
          sort: ((sort && sort.direction === 'descending') ? `-${sort.property}` : get(sort, 'property', 'created_at')),
          'page[number]': (currentPageNumber || 1),
          'page[size]': 10,
          search: (searchValue && searchValue.length > 0 ? searchValue : null)
        }, isNil);

        return usersStream({ queryParameters, cacheStream: false }).observable.map((users) => ({ users, sort, currentPageNumber }));
      }).subscribe(({ users, sort, currentPageNumber }) => {
        const sortProperty = get(sort, 'property', undefined);
        const sortDirection = get(sort, 'direction', undefined);
        const lastPageUrl = get(users, 'links.last', null);
        const lastPageNumber = (getPageNumberFromUrl(lastPageUrl) || currentPageNumber);
        this.setState({ users, sortProperty, sortDirection, currentPageNumber, lastPageNumber });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handlePaginationClick = (newCurrentPageNumber: number) => {
    this.currentPageNumber$.next(newCurrentPageNumber);
  }

  handleOnSort = (property: string) => () => {
    this.sort$.next({
      property,
      direction: (this.state.sortDirection === 'descending' ? 'ascending' : 'descending')
    });
  }

  handleSearchOnChange = (event) => {
    this.searchValue$.next(event.target.value);
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
    const { users, sortProperty, sortDirection, currentPageNumber, lastPageNumber, exporting } = this.state;

    if (users) {
      return (
        <Container>
          <HeaderContainer>
            <HeaderTitle>
              <FormattedMessage {...messages.headerIndex} />
            </HeaderTitle>

            <Button
              style="cl-blue"
              onClick={this.handleUserExport}
              processing={exporting}
              circularCorners={false}
            >
              <FormattedMessage {...messages.exportUsers} />
            </Button>
          </HeaderContainer>

          <PageWrapper>
            <Input icon="search" onChange={this.handleSearchOnChange} />
            <Table sortable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell sorted={sortProperty === 'last_name' ? sortDirection : undefined} onClick={this.handleOnSort('last_name')}>
                    <FormattedMessage {...messages.name} />
                  </Table.HeaderCell>
                  <Table.HeaderCell sorted={sortProperty === 'email' ? sortDirection : undefined} onClick={this.handleOnSort('email')}>
                    <FormattedMessage {...messages.email} />
                  </Table.HeaderCell>
                  <Table.HeaderCell sorted={sortProperty === 'created_at' ? sortDirection : undefined} onClick={this.handleOnSort('created_at')}>
                    <FormattedMessage {...messages.member} />
                  </Table.HeaderCell>
                  <Table.HeaderCell textAlign="center" sorted={sortProperty === 'role' ? sortDirection : undefined} onClick={this.handleOnSort('role')}>
                    <FormattedMessage {...messages.admin} />
                  </Table.HeaderCell>
                  <Table.HeaderCell textAlign="center">
                    <FormattedMessage {...messages.delete} />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {users.data.map((user) => {
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
                        <Toggle checked={isAdmin} onToggle={this.handleOnAdminToggle(user)} />
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Popup
                          trigger={<SemanticButton icon="trash" />}
                          content={<SemanticButton color="red" content={<FormattedMessage {...messages.deleteUser} />} onClick={this.handleOnDeleteUser(user.id)} />}
                          on="click"
                          position="right center"
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>

              {(currentPageNumber && lastPageNumber && lastPageNumber > 1) &&
              <Table.Footer fullWidth={true}>
                <Table.Row>
                  <Table.HeaderCell colSpan="6">
                    <Pagination
                      currentPage={currentPageNumber}
                      totalPages={lastPageNumber}
                      loadPage={this.handlePaginationClick}
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
              }
            </Table>
          </PageWrapper>
        </Container>
      );
    }

    return null;
  }
}
