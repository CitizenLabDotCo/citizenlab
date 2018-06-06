import React from 'react';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { usersStream, IUserData } from 'services/users';
import shallowCompare from 'utils/shallowCompare';
import { getPageNumberFromUrl, getSortAttribute, getSortDirection, SortDirection } from 'utils/paginationUtils';
import { isNilOrError } from 'utils/helperUtils';

export type SortAttribute = 'email' | 'last_name' | 'created_at' | 'role';
export type Sort = 'created_at' | '-created_at' | 'last_name' | '-last_name' | 'email' | '-email' | 'role' | '-role';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  search?: string;
  groupId?: string;
  noCache?: boolean;
}

interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  search?: string;
  group?: string;
}

type children = (obj: GetUsersChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

type State = {
  queryParameters: IQueryParameters;
  usersList: IUserData[] | undefined | null | Error;
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

export default class GetUsers extends React.Component<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
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
        group: undefined
      },
      usersList: undefined,
      sortAttribute: getSortAttribute<Sort, SortAttribute>(initialSort),
      sortDirection: getSortDirection<Sort>(initialSort),
      currentPage: 1,
      lastPage: 1
    };
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);

    this.queryParameters$ = new BehaviorSubject(queryParameters);

    this.subscriptions = [
      this.queryParameters$.pipe(
        distinctUntilChanged((x, y) => shallowCompare(x, y)),
        switchMap((queryParameters) => {
          const oldPageNumber = this.state.queryParameters['page[number]'];
          const newPageNumber = queryParameters['page[number]'];
          queryParameters['page[number]'] = (newPageNumber !== oldPageNumber ? newPageNumber : 1);

          return usersStream({
            queryParameters,
            cacheStream: !this.props.noCache
          }).observable.pipe(map(users => ({ users, queryParameters })));
        })
      ).subscribe(({ users, queryParameters }) => {
        this.setState({
          queryParameters,
          usersList: (!isNilOrError(users) ? users.data : users),
          sortAttribute: getSortAttribute<Sort, SortAttribute>(queryParameters.sort),
          sortDirection: getSortDirection<Sort>(queryParameters.sort),
          currentPage: getPageNumberFromUrl(users.links.self) || 1,
          lastPage: getPageNumberFromUrl(users.links.last) || 1
        });
      })
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!shallowCompare(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(this.state, this.props);
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getQueryParameters = (state: State, props: Props) => {
    // const pageNumber = (!isNil(props.pageNumber) ? props.pageNumber : state.queryParameters['page[number]']);
    // const pageSize = (!isNil(props.pageSize) ? props.pageSize : state.queryParameters['page[size]']);
    // const sort = (!isNil(props.sort) ? props.sort : state.queryParameters.sort);
    // const search = (!isNil(props.search) ? props.search : state.queryParameters.search);
    // const group = (!isNil(props.groupId) ? props.groupId : state.queryParameters.group);

    // return {
    //   sort,
    //   search,
    //   group,
    //   'page[number]': pageNumber,
    //   'page[size]': pageSize,
    // };

    return {
      ...state.queryParameters,
      ...omitBy({
        'page[number]': props.pageNumber,
        'page[size]': props.pageSize,
        sort: props.sort,
        search: props.search,
        group: props.groupId
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

  handleChangeSearchTerm = (searchTerm: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      search: searchTerm
    });
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
