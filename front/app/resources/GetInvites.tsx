import React from 'react';
import {
  Subscription,
  Subject,
  BehaviorSubject,
  combineLatest,
  merge,
} from 'rxjs';
import {
  map,
  startWith,
  distinctUntilChanged,
  switchMap,
  debounceTime,
} from 'rxjs/operators';
import { IInviteData, invitesStream } from 'services/invites';
import shallowCompare from 'utils/shallowCompare';
import { isEqual, omitBy, isString, isEmpty, isNil } from 'lodash-es';
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';

export type SortAttribute =
  | 'email'
  | 'last_name'
  | 'created_at'
  | 'invite_status';
export type Sort =
  | 'email'
  | '-email'
  | 'last_name'
  | '-last_name'
  | 'created_at'
  | '-created_at'
  | 'invite_status'
  | '-invite_status';
export type InviteStatus = 'pending' | 'accepted';

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

interface State {
  queryParameters: IQueryParameters;
  invitesList: IInviteData[] | undefined | null;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
}

export type GetInvitesChildProps = State & {
  onChangeSorting: (sortAttribute: SortAttribute) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangePage: (pageNumber: number) => void;
  onChangeFilterInviteStatus: (inviteStatus: InviteStatus) => void;
};

export default class GetInvites extends React.Component<Props, State> {
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
        invite_status: undefined,
      },
      invitesList: undefined,
      sortAttribute: getSortAttribute<Sort, SortAttribute>(initialSort),
      sortDirection: getSortDirection<Sort>(initialSort),
      currentPage: 1,
      lastPage: 1,
    };
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);

    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new Subject();

    const queryParameters$ = this.queryParameters$.pipe(
      distinctUntilChanged((x, y) => shallowCompare(x, y))
    );

    const queryParametersSearch$ = queryParameters$.pipe(
      map((queryParameters) => queryParameters.search),
      distinctUntilChanged()
    );

    const search$ = merge(
      this.search$.pipe(debounceTime(500)),
      queryParametersSearch$
    ).pipe(
      startWith(queryParameters.search),
      map((searchValue) =>
        isString(searchValue) && !isEmpty(searchValue) ? searchValue : undefined
      ),
      distinctUntilChanged()
    );

    this.subscriptions = [
      combineLatest([queryParameters$, search$])
        .pipe(
          map(([queryParameters, search]) => ({ ...queryParameters, search })),
          switchMap((queryParameters) => {
            const oldPageNumber = this.state.queryParameters['page[number]'];
            const newPageNumber = queryParameters['page[number]'];
            queryParameters['page[number]'] =
              newPageNumber !== oldPageNumber ? newPageNumber : 1;

            return invitesStream({
              queryParameters,
            }).observable.pipe(
              map((invites) => ({ invites, queryParameters }))
            );
          })
        )
        .subscribe(({ invites, queryParameters }) => {
          this.setState({
            queryParameters,
            invitesList: invites ? invites.data : null,
            sortAttribute: getSortAttribute<Sort, SortAttribute>(
              queryParameters.sort
            ),
            sortDirection: getSortDirection<Sort>(queryParameters.sort),
            currentPage: getPageNumberFromUrl(invites.links.self) || 1,
            lastPage: getPageNumberFromUrl(invites.links.last) || 1,
          });
        }),
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: _prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: _nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(this.state, this.props);
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getQueryParameters = (state: State, props: Props) => {
    return {
      ...state.queryParameters,
      ...omitBy(
        {
          'page[number]': props.pageNumber,
          'page[size]': props.pageSize,
          sort: props.sort,
          search: props.search,
        },
        isNil
      ),
    };
  };

  handleChangeSorting = (newSortAttribute: SortAttribute) => {
    const { sort: oldSort } = this.state.queryParameters;
    const oldSortAttribute = getSortAttribute<Sort, SortAttribute>(oldSort);
    const oldSortDirection = getSortDirection<Sort>(oldSort);
    const newSortDirection =
      newSortAttribute === oldSortAttribute && oldSortDirection === 'descending'
        ? 'ascending'
        : 'descending';
    const newSortDirectionSymbol = newSortDirection === 'descending' ? '-' : '';
    const sort = `${newSortDirectionSymbol}${newSortAttribute}` as Sort;

    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort,
    });
  };

  handleChangeSearchTerm = (searchTerm) => {
    this.search$.next(searchTerm);
  };

  handleChangePage = (pageNumber: number) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      'page[number]': pageNumber,
    });
  };

  handleChangeFilterInviteStatus = (inviteStatus: InviteStatus) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      invite_status: inviteStatus,
    });
  };

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
