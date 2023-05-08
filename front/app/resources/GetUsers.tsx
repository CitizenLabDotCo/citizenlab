import React from 'react';
import { isNil, omitBy } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { usersStream, IUserData } from 'services/users';
import shallowCompare from 'utils/shallowCompare';
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';
import { isNilOrError } from 'utils/helperUtils';

export type SortAttribute = 'email' | 'last_name' | 'created_at' | 'role';
export type Sort =
  | 'created_at'
  | '-created_at'
  | 'last_name'
  | '-last_name'
  | 'email'
  | '-email'
  | 'role'
  | '-role';

export interface InputProps {
  // Not used?
  pageNumber?: IQueryParameters['page[number]'];
  pageSize?: IQueryParameters['page[size]'];
  sort?: IQueryParameters['sort'];
  search?: IQueryParameters['search'];
  groupId?: IQueryParameters['group'];
  // https://citizenlab.atlassian.net/browse/CL-3240
  // project id needs to be passed
  canModerateProject?: IQueryParameters['can_moderate_project'];
  // Don't work with false
  // https://citizenlab.atlassian.net/browse/CL-3226
  canModerate?: IQueryParameters['can_moderate'];
  canAdmin?: IQueryParameters['can_admin'];
  onlyBlocked?: IQueryParameters['only_blocked'];
  notCitizenlabMember?: IQueryParameters['not_citizenlab_member'];
  includeInactive?: IQueryParameters['include_inactive'];
  isNotProjectModeratorOfProjectId?: IQueryParameters['is_not_project_moderator'];
  isNotFolderModeratorOfFolderId?: IQueryParameters['is_not_folder_moderator'];
}

interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  search?: string;
  group?: string;
  can_moderate_project?: string;
  can_moderate?: true;
  can_admin?: true;
  only_blocked?: boolean;
  not_citizenlab_member?: boolean;
  include_inactive?: boolean;
  // Pass project id to exclude all users who can moderate
  // the project
  is_not_project_moderator?: string;
  // Pass folder id to exclude all users who can moderate
  // the folder
  is_not_folder_moderator?: string;
}

type children = (obj: GetUsersChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

type State = {
  queryParameters: IQueryParameters;
  usersList: IUserData[] | undefined | null | Error;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
  loadMoreCount: number;
  isLoading: boolean;
};

export type GetUsersChildProps = State & {
  onChangeSorting: (sortAttribute: SortAttribute) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangePage: (pageNumber: number) => void;
  onLoadMore: () => void;
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
        group: undefined,
        can_moderate_project: undefined,
        can_moderate: undefined,
        can_admin: undefined,
        only_blocked: undefined,
        not_citizenlab_member: undefined,
        include_inactive: undefined,
        is_not_project_moderator: undefined,
        is_not_folder_moderator: undefined,
      },
      usersList: undefined,
      sortAttribute: getSortAttribute<Sort, SortAttribute>(initialSort),
      sortDirection: getSortDirection<Sort>(initialSort),
      currentPage: 1,
      loadMoreCount: 1,
      isLoading: false,
      lastPage: 1,
    };
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);

    this.queryParameters$ = new BehaviorSubject(queryParameters);

    this.subscriptions = [
      this.queryParameters$
        .pipe(
          distinctUntilChanged((x, y) => shallowCompare(x, y)),
          switchMap((queryParameters) => {
            const oldPageNumber = this.state.queryParameters['page[number]'];
            const newPageNumber = queryParameters['page[number]'];
            queryParameters['page[number]'] =
              newPageNumber !== oldPageNumber ? newPageNumber : 1;
            return usersStream({
              queryParameters,
            }).observable.pipe(map((users) => ({ users, queryParameters })));
          })
        )
        .subscribe(({ users, queryParameters }) => {
          const currentPageNumberFromURL = getPageNumberFromUrl(
            users.links.self
          );
          const lastPageNumberFromURL = getPageNumberFromUrl(users.links.last);

          this.setState({
            queryParameters,
            isLoading: false,
            usersList: !isNilOrError(users) ? users.data : users,
            sortAttribute: getSortAttribute<Sort, SortAttribute>(
              queryParameters.sort
            ),
            sortDirection: getSortDirection<Sort>(queryParameters.sort),
            currentPage: currentPageNumberFromURL || 1,
            lastPage: lastPageNumberFromURL || 1,
          });
        }),
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: _prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: _nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!shallowCompare(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
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
          group: props.groupId,
          can_moderate_project: props.canModerateProject,
          can_moderate: props.canModerate,
          can_admin: props.canAdmin,
          only_blocked: props.onlyBlocked,
          not_citizenlab_member: props.notCitizenlabMember,
          include_inactive: props.includeInactive,
          is_not_project_moderator: props.isNotProjectModeratorOfProjectId,
          is_not_folder_moderator: props.isNotFolderModeratorOfFolderId,
        },
        isNil
      ),
    };
  };

  handleChangeSorting = (newSortAttribute: SortAttribute) => {
    const oldSortAttribute = getSortAttribute<Sort, SortAttribute>(
      this.state.queryParameters.sort
    );
    const oldSortDirection = getSortDirection<Sort>(
      this.state.queryParameters.sort
    );
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

  handleChangeSearchTerm = (search: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      search,
    });
  };

  handleChangePage = async (pageNumber: number) => {
    return this.queryParameters$.next({
      ...this.state.queryParameters,
      'page[number]': pageNumber,
    });
  };

  handleLoadMore = () => {
    this.setState({
      loadMoreCount: this.state.loadMoreCount + 1,
      isLoading: true,
    });
    this.queryParameters$.next({
      ...this.state.queryParameters,
      'page[size]':
        this.state.queryParameters['page[size]'] *
        (this.state.loadMoreCount + 1),
    });
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangeSorting: this.handleChangeSorting,
      onChangeSearchTerm: this.handleChangeSearchTerm,
      onChangePage: this.handleChangePage,
      onLoadMore: this.handleLoadMore,
    });
  }
}
