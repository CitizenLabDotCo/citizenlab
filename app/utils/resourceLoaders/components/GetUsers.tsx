import React from 'react';
import { BehaviorSubject, Subject, Subscription, Observable } from 'rxjs/Rx';
import { usersStream, IUserData } from 'services/users';
import shallowCompare from 'utils/shallowCompare';
import { isEqual, omitBy, isNil, isString, isEmpty } from 'lodash';
import { getPageNumberFromUrl, getSortAttribute, getSortDirection, SortDirection } from 'utils/paginationUtils';

export type SortAttribute = 'email' | 'last_name' | 'created_at' | 'role';
export type Sort = 'created_at' | '-created_at' | 'last_name' | '-last_name' | 'email' | '-email' | 'role' | '-role';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  search?: string;
}

interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  search: string | undefined;
}

type children = (obj: GetUsersChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

type State = {
  queryParameters: IQueryParameters;
  usersList: IUserData[] | null;
  sortAttribute: SortAttribute,
  sortDirection: SortDirection,
  currentPage: number;
  lastPage: number;
};

export type GetUsersChildProps = State & {
  onChangeSorting: (sortAttribute: SortAttribute) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangePage: (pageNumber: number) => void;
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
        search: undefined
      },
      usersList: null,
      sortAttribute: getSortAttribute<Sort, SortAttribute>(initialSort),
      sortDirection: getSortDirection<Sort>(initialSort),
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
        const oldPageNumber = this.state.queryParameters['page[number]'];
        const newPageNumber = queryParameters['page[number]'];
        queryParameters['page[number]'] = (newPageNumber !== oldPageNumber ? newPageNumber : 1);

        return usersStream({ queryParameters, cacheStream: false }).observable.map(invites => ({ invites, queryParameters }));
      }).subscribe(({ invites, queryParameters }) => {
        this.setState({
          queryParameters,
          usersList: invites.data,
          sortAttribute: getSortAttribute<Sort, SortAttribute>(queryParameters.sort),
          sortDirection: getSortDirection<Sort>(queryParameters.sort),
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

  handleChangeSorting = (newSortAttribute: SortAttribute) => {
    const oldSortAttribute = getSortAttribute<Sort, SortAttribute>(this.state.queryParameters.sort);
    const oldSortDirection = getSortDirection<Sort>(this.state.queryParameters.sort);
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

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangeSorting: this.handleChangeSorting,
      onChangeSearchTerm: this.handleChangeSearchTerm,
      onChangePage: this.handleChangePage
    });
  }
}
