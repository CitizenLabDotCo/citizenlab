import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { usersStream, updateUser, IUsers } from 'services/users';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 500px;
  margin-top: 50px;
`;

const StyledInput = styled.input`
  font-size: 16px;
  padding: 10px;
  border: solid 1px black;
  border-radius: 5px;
  outline: none;
  background: #fff;
  margin-right: 10px;
`;

const StyledTable = styled.table`
  width: 100%;
  background: #fff;

  .author {
    width: 200px;
  }

  tr {
    border: solid 1px #ccc;

    th, td {
      padding: 10px;
    }

    th {
      cursor: pointer;
      font-weight: 600;
    }
  }
`;

const Pages = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;

  button {
    outline: none;
  }
`;

const PageNumber: any = styled.div`
  color: ${(props: any) => props.selected ? '#fff' : '#333'};
  background: #eee;
  border-radius: 5px;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  background: ${(props: any) => props.selected ? '#333' : '#eee'};
`;

type Props = {};

type State = {
  users: IUsers | null
  sortBy: string;
  pageNumber: number;
  pageCount: number | null;
  searchValue: string;
};

export default class UsersTable extends React.PureComponent<Props, State> {
  search$: Rx.BehaviorSubject<string>;
  sortBy$: Rx.BehaviorSubject<string>;
  pageNumber$: Rx.BehaviorSubject<number>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      users: null,
      sortBy: 'last_name',
      pageNumber: 1,
      pageCount: 0,
      searchValue: ''
    };
    this.search$ = new Rx.BehaviorSubject(this.state.searchValue);
    this.sortBy$ = new Rx.BehaviorSubject(this.state.sortBy);
    this.pageNumber$ = new Rx.BehaviorSubject(this.state.pageNumber);
  }

  componentDidMount() {
    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.sortBy$.distinctUntilChanged(),
        this.search$.distinctUntilChanged(),
        this.pageNumber$
      ).switchMap(([sortBy, searchValue, pageNumber]) => {
        const searchChanged = (searchValue !== this.state.searchValue);
        const sortChanged = (sortBy !== this.state.sortBy);
        const processedPageNumber = (searchChanged || sortChanged ? 1 : pageNumber);

        const users$ = usersStream({
          queryParameters: {
            sort: sortBy,
            'page[number]': processedPageNumber,
            'page[size]': 4,
            search: searchValue
          }
        });

        return users$.observable.map((users) => ({ users, sortBy, pageNumber, searchValue }));
      }).subscribe(({ users, sortBy, pageNumber, searchValue }) => {
        let pageCount: number | null = null;

        if (users && _.has(users, 'links') && !_.isEmpty(users.links)) {
          const newPageCount = getPageNumberFromUrl(users.links.last);
          pageCount = (newPageCount || this.state.pageCount);
        }

        this.setState({ users, sortBy, pageNumber, searchValue, pageCount });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToPage = (page: 'previous' | 'next' | number) => () => {
    const { pageNumber, pageCount } = this.state;
    let newPageNumber = pageNumber;

    if (page === 'next' && pageCount && pageNumber < pageCount) {
      newPageNumber = pageNumber + 1;
    } else if (page === 'previous' && pageNumber > 1) {
      newPageNumber = pageNumber - 1;
    } else if (_.isNumber(page)) {
      newPageNumber = page;
    }

    if (newPageNumber !== pageNumber) {
      this.pageNumber$.next(newPageNumber);
    }
  }

  sortBy = (type: string) => () => {
    let sortBy = type;

    if (type === this.state.sortBy.replace(/^-/, '')) {
      sortBy = (this.state.sortBy.startsWith('-') ? type : `-${type}`);
    }

    this.sortBy$.next(sortBy);
  }

  onInputChange = (event) => {
    this.search$.next(event.target.value);
  }

  update = (userId) => () => {
    updateUser(userId, { first_name: `Test${Date.now()}` });
  }

  render () {
    const { users, pageNumber, pageCount, searchValue } = this.state;

    return (
      <Container>
        <Pages>
          <StyledInput type="text" onChange={this.onInputChange} value={searchValue} />
          {pageCount && <button onClick={this.goToPage('previous')}>&laquo;</button>}
          {pageCount && [...Array(pageCount + 1).keys()].filter(i => i > 0).map((i) => (
            <PageNumber selected={(i === pageNumber)} key={i} onClick={this.goToPage(i)}>{i}</PageNumber>
          ))}
          {pageCount && <button onClick={this.goToPage('next')}>&raquo;</button>}
        </Pages>

        <StyledTable>
          <thead>
            <tr>
              <th>First name</th>
              <th onClick={this.sortBy('last_name')}>Last name</th>
              <th onClick={this.sortBy('email')}>Email</th>
              <th onClick={this.sortBy('created_at')}>Created at</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users && users.data.map((user) => (
              <tr key={user.id}>
                <td>{user.attributes.first_name}</td>
                <td>{user.attributes.last_name}</td>
                <td>{user.attributes.email}</td>
                <td>{user.attributes.created_at}</td>
                <td><button onClick={this.update(user.id)} >update</button></td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </Container>
    );
  }
}
