import React from 'react';
import { BehaviorSubject, Subject, Subscription, Observable } from 'rxjs/Rx';
import { IInviteData, invitesStream } from 'services/invites';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import shallowCompare from 'utils/shallowCompare';
import { isEqual, omit, omitBy, isString, isEmpty, isNil } from 'lodash';

export type SortAttribute = 'email' | 'last_name' | 'created_at' | 'invite_status';
type SortDirection = 'ascending' | 'descending';
type Sort = 'email' | '-email' | 'last_name' | '-last_name' | 'created_at' | '-created_at' | 'invite_status' | '-invite_status';
type InviteStatus = 'pending' | 'accepted';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  search?: string;
  inviteStatus?: string[];
}

interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  search: string | undefined;
  invite_status: InviteStatus | undefined;
}

type children = (renderProps: GetInvitesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

type State = {
  queryParameters: IQueryParameters;
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
  queryParameters$: BehaviorSubject<IQueryParameters>;
  search$: Subject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);

    const initialSort: Partial<Sort> = '-created_at';

    this.state = {
      // defaults
      queryParameters: {
        'page[number]': 1,
        'page[size]': 20,
        sort: initialSort,
        search: undefined,
        invite_status: undefined
      },
      invites: null,
      sortAttribute: this.getSortAttribute(initialSort),
      sortDirection: this.getSortDirection(initialSort),
      currentPage: 1,
      lastPage: 1
    };
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);

    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new Subject();

    const queryParameters$ = this.queryParameters$.distinctUntilChanged((x, y) => shallowCompare(x, y));
    const queryParametersSearch$ = queryParameters$.map(queryParameters => queryParameters.search).distinctUntilChanged();
    const search$ = Observable.merge(
      this.search$.debounceTime(500),
      queryParametersSearch$
    )
    .startWith(queryParameters.search)
    .map(searchValue => ((isString(searchValue) && !isEmpty(searchValue)) ? searchValue : undefined))
    .distinctUntilChanged();

    this.subscriptions = [
      Observable.combineLatest(
        queryParameters$,
        search$
      )
      .map(([queryParameters, search]) => ({ ...queryParameters, search }))
      .switchMap((queryParameters) => {
        const oldPartialQuery = omit(this.state.queryParameters, 'page[number]');
        const newPartialQuery = omit(queryParameters, 'page[number]');
        queryParameters['page[number]'] = (!isEqual(oldPartialQuery, newPartialQuery) ? 1 : queryParameters['page[number]']);
        return invitesStream({ queryParameters, cacheStream: false }).observable.map(invites => ({ invites, queryParameters }));
      }).subscribe(({ invites, queryParameters }) => {
        this.setState({
          queryParameters,
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
    const { children: prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(this.state, this.props);
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getQueryParameters = (state: State, props: Props) => {
    return {
      ...state.queryParameters,
      ...omitBy({
        'page[number]': props.pageNumber,
        'page[size]': props.pageSize,
        sort: props.sort,
        search: props.search
      }, isNil)
    };
  }

  getSortAttribute = (sort: Sort) => {
    return sort.replace(/^-/, '') as SortAttribute;
  }

  getSortDirection = (sort: Sort) => {
    return sort.startsWith('-') ? 'descending' : 'ascending';
  }

  handleChangeSorting = (newSortAttribute: SortAttribute) => {
    const { sort: oldSort } = this.state.queryParameters;
    const oldSortAttribute = this.getSortAttribute(oldSort);
    const oldSortDirection = this.getSortDirection(oldSort);
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
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangeSorting: this.handleChangeSorting,
      onChangeSearchTerm: this.handleChangeSearchTerm,
      onChangePage: this.handleChangePage,
      onChangeFilterInviteStatus: this.handleChangeFilterInviteStatus,
    });
  }
}
