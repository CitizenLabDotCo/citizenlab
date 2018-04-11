import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { IInviteData, invitesStream } from 'services/invites';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import shallowCompare from 'utils/shallowCompare';
import { isEqual, omit } from 'lodash';

export type SortAttribute = 'email' | 'last_name' | 'created_at' | 'invite_status';
type SortDirection = 'ascending' | 'descending';
type Sort =  'email' | '-email' | 'last_name' | '-last_name' | 'created_at' | '-created_at' | 'invite_status' | '-invite_status';
type InviteStatus = 'pending' | 'accepted';

export interface IInputQueryParameters {
  'page[number]'?: number;
  'page[size]'?: number;
  sort?: Sort;
  search?: string;
  invite_status?: InviteStatus;
}

interface IInternalQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  search: string;
  invite_status?: InviteStatus;
}

interface InputProps {
  queryParameters?: IInputQueryParameters;
}

interface Props extends InputProps {
  children: (obj: GetInvitesChildProps) => JSX.Element | null;
}

type State = {
  queryParameters: IInternalQueryParameters;
  searchValue: string;
  invites: IInviteData[] | null;
  sortAttribute: SortAttribute,
  sortDirection: SortDirection,
  currentPage: number;
  lastPage: number;
};

export type GetInvitesChildProps = State & {
  onChangeSorting: (sortAttribute: SortAttribute) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangePage: (pageNumber: number) => void;
  onChangeFilterInviteStatus: (inviteStatus: InviteStatus) => void;
};

export default class GetInvites extends React.PureComponent<Props, State> {
  queryParameters$: BehaviorSubject<IInternalQueryParameters>;
  search$: BehaviorSubject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);

    const initialSort = '-created_at';

    this.state = {
      queryParameters: {
        'page[number]': 1,
        'page[size]': 20,
        sort: initialSort,
        search: '',
        invite_status: undefined
      },
      invites: null,
      searchValue: '',
      sortAttribute: this.getSortAttribute(initialSort),
      sortDirection: this.getSortDirection(initialSort),
      currentPage: 1,
      lastPage: 1
    };
  }

  componentDidMount() {
    const queryParameters = { ...this.state.queryParameters, ...this.props.queryParameters };
    const searchValue = (queryParameters.search || '');

    this.queryParameters$ = new BehaviorSubject({ ...this.state.queryParameters, ...this.props.queryParameters });
    this.search$ = new BehaviorSubject(searchValue);

    this.subscriptions = [
      Observable.combineLatest(
        this.queryParameters$
          .distinctUntilChanged((x, y) => shallowCompare(x, y)),
        this.search$
          .map(searchValue => (searchValue || ''))
          .do(searchValue => this.setState({ searchValue }))
          .debounceTime(400)
          .startWith('')
          .distinctUntilChanged()
      ).switchMap(([queryParameters, searchValue]) => {
        queryParameters.search = (searchValue || '');
        const oldPartialQuery = omit(this.state.queryParameters, 'page[number]');
        const newPartialQuery = omit(queryParameters, 'page[number]');
        queryParameters['page[number]'] = (!isEqual(oldPartialQuery, newPartialQuery) ? 1 : queryParameters['page[number]']);
        return invitesStream({ queryParameters, cacheStream: false }).observable.map(invites => ({ invites, queryParameters, searchValue }));
      }).subscribe(({ invites, queryParameters, searchValue }) => {
        this.setState({
          queryParameters,
          searchValue,
          invites: invites.data,
          sortAttribute: this.getSortAttribute(queryParameters.sort),
          sortDirection: this.getSortDirection(queryParameters.sort),
          currentPage: getPageNumberFromUrl(invites.links.self) || 1,
          lastPage: getPageNumberFromUrl(invites.links.last) || 1
        });
      })
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    if (!isEqual(prevProps.queryParameters, this.props.queryParameters)) {
      this.queryParameters$.next({ ...this.state.queryParameters, ...this.props.queryParameters });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getSortAttribute(sort: Sort) {
    return sort.replace(/^-/, '') as SortAttribute;
  }

  getSortDirection(sort: Sort) {
    return sort.startsWith('-') ? 'descending' : 'ascending';
  }

  handleChangeSorting = (newSortAttribute: SortAttribute) => {
    const oldSortAttribute = this.getSortAttribute(this.state.queryParameters.sort);
    const oldSortDirection = this.getSortDirection(this.state.queryParameters.sort);
    const newSortDirection = (newSortAttribute === oldSortAttribute && oldSortDirection === 'descending') ? 'ascending' : 'descending';
    const newSortDirectionSymbol = (newSortDirection === 'descending' ? '-' : '');
    const sort = `${newSortDirectionSymbol}${newSortAttribute}` as Sort;

    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort
    });
  }

  handleChangeSearchTerm = (searchTerm) => {
    this.search$.next(searchTerm);
  }

  handleChangePage = (pageNumber: number) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      'page[number]': pageNumber
    });
  }

  handleChangeFilterInviteStatus = (inviteStatus: InviteStatus) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      invite_status: inviteStatus
    });
  }

  render() {
    return this.props.children({
      ...this.state,
      onChangeSorting: this.handleChangeSorting,
      onChangeSearchTerm: this.handleChangeSearchTerm,
      onChangePage: this.handleChangePage,
      onChangeFilterInviteStatus: this.handleChangeFilterInviteStatus,
    });
  }
}
