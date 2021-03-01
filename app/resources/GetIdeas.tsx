import React from 'react';
import {
  get,
  isString,
  isEqual,
  isBoolean,
  omit,
  cloneDeep,
  omitBy,
  isNil,
  isArray,
  unionBy,
} from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  mergeScan,
  switchMap,
} from 'rxjs/operators';
import {
  ideasStream,
  IIdeaData,
  IdeaPublicationStatus,
  ideasMiniStream,
} from 'services/ideas';
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';

export type SortAttribute =
  | 'new'
  | 'trending'
  | 'popular'
  | 'author_name'
  | 'upvotes_count'
  | 'downvotes_count'
  | 'baskets_count'
  | 'status';
export type Sort =
  | 'random'
  | 'new'
  | '-new'
  | 'trending'
  | '-trending'
  | 'popular'
  | '-popular'
  | 'author_name'
  | '-author_name'
  | 'upvotes_count'
  | '-upvotes_count'
  | 'downvotes_count'
  | '-downvotes_count'
  | 'baskets_count'
  | '-baskets_count'
  | 'status'
  | '-status';
type PublicationStatus = IdeaPublicationStatus;

export interface InputProps {
  type: 'load-more' | 'paginated';
  pageNumber?: number;
  pageSize?: number;
  projectIds?: string[] | 'all';
  phaseId?: string;
  authorId?: string;
  sort?: Sort;
  search?: string;
  topics?: string[];
  areas?: string[];
  ideaStatusId?: string;
  publicationStatus?: PublicationStatus;
  projectPublicationStatus?: ProjectPublicationStatus;
  boundingBox?: number[];
  cache?: boolean;
  assignee?: string;
  feedbackNeeded?: boolean;
  // prop mini Gets stripped down ideas containing only title, should never be cached,
  // and is not tested in all scenarios, but improves performance drastically.
  mini?: boolean;
}

export interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  projects: string[] | undefined | null;
  phase: string | undefined | null;
  author: string | undefined | null;
  sort: Sort;
  search: string | undefined | null;
  topics: string[] | undefined | null;
  areas: string[] | undefined | null;
  idea_status: string | undefined | null;
  publication_status: PublicationStatus | undefined | null;
  project_publication_status: ProjectPublicationStatus | undefined | null;
  bounding_box: number[] | undefined | null;
  assignee: string | undefined | null;
  feedback_needed: boolean | undefined | null;
}

interface IAccumulator {
  ideas: IIdeaData[] | null;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

type children = (renderProps: GetIdeasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetIdeasChildProps) => JSX.Element | null;
}

export type GetIdeasChildProps = State & {
  onLoadMore: () => void;
  onChangePage: (pageNumber: number) => void;
  onChangeProjects: (projectIds: string[]) => void;
  onChangePhase: (phaseId: string) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangeSorting: (sort: Sort) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeStatus: (ideaStatus: string | null) => void;
  onChangePublicationStatus: (publicationStatus: PublicationStatus) => void;
  onChangeProjectPublicationStatus: (
    ProjectPublicationStatus: ProjectPublicationStatus
  ) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean) => void;
  onIdeaFiltering: (partialQueryParameters: Partial<IQueryParameters>) => void;
  onResetParams: (paramsToOmit?: (keyof IQueryParameters)[]) => void;
  type: 'ideas';
};

interface State {
  queryParameters: IQueryParameters;
  list: IIdeaData[] | undefined | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
}

export default class GetIdeas extends React.Component<Props, State> {
  defaultQueryParameters: IQueryParameters;
  queryParameters$: BehaviorSubject<IQueryParameters>;
  subscriptions: Subscription[];

  static defaultProps = {
    pageNumber: 1,
    pageSize: 12,
    sort: 'random',
  };

  constructor(props: Props) {
    super(props);
    this.defaultQueryParameters = {
      'page[number]': props.pageNumber as number,
      'page[size]': props.pageSize as number,
      sort: props.sort as Sort,
      projects: undefined,
      phase: undefined,
      author: undefined,
      search: undefined,
      topics: undefined,
      areas: undefined,
      idea_status: undefined,
      publication_status: undefined,
      project_publication_status: undefined,
      bounding_box: undefined,
      assignee: undefined,
      feedback_needed: undefined,
    };
    const queryParameters = this.getQueryParameters(
      this.defaultQueryParameters,
      props
    );
    this.state = {
      // defaults
      queryParameters,
      list: undefined,
      hasMore: false,
      querying: true,
      loadingMore: false,
      sortAttribute: getSortAttribute<Sort, SortAttribute>(props.sort as Sort),
      sortDirection: getSortDirection<Sort>(props.sort as Sort),
      currentPage: 1,
      lastPage: 1,
    };
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(
      this.state.queryParameters,
      this.props
    );
    const startAccumulatorValue: IAccumulator = {
      queryParameters,
      ideas: null,
      hasMore: false,
    };
    const queryParameters$ = this.queryParameters$.pipe(
      distinctUntilChanged((prev, next) => isEqual(prev, next))
    );

    if (!this.props.type || this.props.type === 'load-more') {
      this.subscriptions = [
        queryParameters$
          .pipe(
            mergeScan<IQueryParameters, IAccumulator>(
              (acc, newQueryParameters) => {
                const oldQueryParamsWithoutPageNumber = omit(
                  cloneDeep(acc.queryParameters),
                  'page[number]'
                );
                const newQueryParamsWithoutPageNumber = omit(
                  cloneDeep(newQueryParameters),
                  'page[number]'
                );
                const oldPageNumber = acc.queryParameters['page[number]'];
                const newPageNumber = newQueryParameters['page[number]'];
                const isLoadingMore =
                  isEqual(
                    oldQueryParamsWithoutPageNumber,
                    newQueryParamsWithoutPageNumber
                  ) && oldPageNumber !== newPageNumber;
                const pageNumber = isLoadingMore
                  ? newQueryParameters['page[number]']
                  : 1;
                const queryParameters: IQueryParameters = {
                  ...newQueryParameters,
                  'page[number]': pageNumber,
                };

                this.setState({
                  querying: !isLoadingMore,
                  loadingMore: isLoadingMore,
                });

                const stream = this.props.mini ? ideasMiniStream : ideasStream;

                return stream({ queryParameters }).observable.pipe(
                  map((ideas) => {
                    const cacheStream = isBoolean(this.props.cache)
                      ? this.props.cache
                      : true;
                    const selfLink = get(ideas, 'links.self');
                    const lastLink = get(ideas, 'links.last');
                    const hasMore =
                      isString(selfLink) &&
                      isString(lastLink) &&
                      selfLink !== lastLink;

                    return {
                      queryParameters,
                      cacheStream,
                      hasMore,
                      ideas: !isLoadingMore
                        ? ideas.data
                        : unionBy(acc.ideas || [], ideas.data, 'id'),
                    };
                  })
                );
              },
              startAccumulatorValue
            )
          )
          .subscribe(({ ideas, queryParameters, hasMore }) => {
            this.setState({
              queryParameters,
              hasMore,
              list: ideas,
              querying: false,
              loadingMore: false,
            });
          }),
      ];
    } else {
      this.subscriptions = [
        queryParameters$
          .pipe(
            switchMap((queryParameters) => {
              const cacheStream = isBoolean(this.props.cache)
                ? this.props.cache
                : true;
              const oldPageNumber = this.state.queryParameters['page[number]'];
              const newPageNumber = queryParameters['page[number]'];
              queryParameters['page[number]'] =
                newPageNumber !== oldPageNumber ? newPageNumber : 1;

              const stream = this.props.mini ? ideasMiniStream : ideasStream;

              return stream({
                queryParameters,
                cacheStream,
              }).observable.pipe(map((ideas) => ({ queryParameters, ideas })));
            })
          )
          .subscribe(({ ideas, queryParameters }) => {
            this.setState({
              queryParameters,
              list: ideas ? ideas.data : null,
              querying: false,
              loadingMore: false,
              sortAttribute: getSortAttribute<Sort, SortAttribute>(
                queryParameters.sort
              ),
              sortDirection: getSortDirection<Sort>(queryParameters.sort),
              currentPage: getPageNumberFromUrl(ideas.links.self) || 1,
              lastPage: getPageNumberFromUrl(ideas.links.last) || 1,
            });
          }),
      ];
    }
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(
        this.state.queryParameters,
        this.props
      );
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  propsToQueryParamsShape = () => ({
    projects: this.props.projectIds,
    'page[number]': this.props.pageNumber as number,
    'page[size]': this.props.pageSize as number,
    phase: this.props.phaseId,
    author: this.props.authorId,
    sort: this.props.sort as Sort,
    topics: this.props.topics,
    areas: this.props.areas,
    idea_status: this.props.ideaStatusId,
    publication_status: this.props.publicationStatus,
    project_publication_status: this.props.projectPublicationStatus,
    bounding_box: this.props.boundingBox,
    assignee: this.props.assignee,
    feedback_needed: this.props.feedbackNeeded,
    search: undefined,
  });

  getQueryParametersFromProps = () => {
    const queryParamsShaped = this.propsToQueryParamsShape();
    Object.keys(queryParamsShaped)
      .filter((key) => queryParamsShaped[key] === null)
      .forEach((key) => (queryParamsShaped[key] = undefined));
    return queryParamsShaped as IQueryParameters; // legal because last line changes null values to undefined
  };

  getQueryParameters = (queryParameters: IQueryParameters, props: Props) => {
    let projects: string[] | undefined | null = undefined;

    if (isNil(props.projectIds)) {
      projects = queryParameters.projects;
    } else if (isArray(props.projectIds)) {
      projects = props.projectIds;
    }

    const inputPropsQueryParameters: IQueryParameters = {
      projects,
      'page[number]': props.pageNumber as number,
      'page[size]': props.pageSize as number,
      phase: props.phaseId,
      author: props.authorId,
      sort: props.sort as Sort,
      search: props.search,
      topics: props.topics,
      areas: props.areas,
      idea_status: props.ideaStatusId,
      publication_status: props.publicationStatus,
      project_publication_status: props.projectPublicationStatus,
      bounding_box: props.boundingBox,
      assignee: props.assignee,
      feedback_needed: props.feedbackNeeded,
    };

    // Omit all queryParameters that are nil.
    // Why do this? Because we assume that an input prop that's nil is an input prop that should be ignored,
    // and not overwrite a none-nil value that's part of this.state.queryParameters.
    return {
      ...queryParameters,
      ...omitBy(inputPropsQueryParameters, isNil),
      // Make an exception for 'projects', because when it's undefined we don't want to ignore it but instead pass it along
      // to let the request know we don't want to apply a projects filter but load the ideas for all projects
      projects,
    };
  };

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': this.state.queryParameters['page[number]'] + 1,
      });
    }
  };

  handleChangePage = (pageNumber: number) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      'page[number]': pageNumber,
    });
  };

  handlePhaseOnChange = (phaseId: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      phase: phaseId,
      'page[number]': 1,
    });
  };

  handleSearchOnChange = (search: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      search: search ? search : undefined,
      'page[number]': 1,
    });
  };

  handleSortOnChange = (sort: Sort) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort,
      'page[number]': 1,
    });
  };

  handleProjectsOnChange = (projects: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      projects,
      'page[number]': 1,
    });
  };

  handleTopicsOnChange = (topics: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      topics,
      'page[number]': 1,
    });
  };

  handleAreasOnchange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas,
      'page[number]': 1,
    });
  };

  handleStatusOnChange = (ideaStatus: string | null) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      idea_status: ideaStatus || undefined,
      'page[number]': 1,
    });
  };

  handlePublicationStatusOnChange = (publicationStatus: PublicationStatus) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      publication_status: publicationStatus,
      'page[number]': 1,
    });
  };

  handleProjectPublicationStatusOnChange = (
    projectPublicationStatus: ProjectPublicationStatus
  ) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      project_publication_status: projectPublicationStatus,
      'page[number]': 1,
    });
  };

  handleAssigneeOnChange = (assignee: string | undefined) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      assignee,
      'page[number]': 1,
    });
  };

  handleFeedbackFilterOnChange = (feedbackNeeded: boolean) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      feedback_needed: feedbackNeeded || undefined,
      'page[number]': 1,
    });
  };

  handleIdeaFiltering = (ideaFilters: Partial<IQueryParameters>) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      ...ideaFilters,
      'page[number]': 1,
    });
  };

  handleResetParamsToProps = (paramsToOmit?: (keyof IQueryParameters)[]) => {
    const defaultQueryParameters = this.getQueryParametersFromProps();

    if (paramsToOmit && paramsToOmit.length > 0) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        ...omit(defaultQueryParameters, paramsToOmit),
      });
    } else {
      this.queryParameters$.next(defaultQueryParameters);
    }
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangePage: this.handleChangePage,
      onChangeProjects: this.handleProjectsOnChange,
      onChangePhase: this.handlePhaseOnChange,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeSorting: this.handleSortOnChange,
      onChangeTopics: this.handleTopicsOnChange,
      onChangeAreas: this.handleAreasOnchange,
      onChangeStatus: this.handleStatusOnChange,
      onChangePublicationStatus: this.handlePublicationStatusOnChange,
      onChangeProjectPublicationStatus: this
        .handleProjectPublicationStatusOnChange,
      onChangeAssignee: this.handleAssigneeOnChange,
      onChangeFeedbackFilter: this.handleFeedbackFilterOnChange,
      onIdeaFiltering: this.handleIdeaFiltering,
      onResetParams: this.handleResetParamsToProps,
      type: 'ideas',
    });
  }
}
