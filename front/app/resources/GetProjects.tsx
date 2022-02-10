import { Component } from 'react';
import {
  isString,
  isEqual,
  get,
  omitBy,
  isNil,
  omit,
  cloneDeep,
} from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, mergeScan, map } from 'rxjs/operators';
import { projectsStream, IProjectData } from 'services/projects';
import shallowCompare from 'utils/shallowCompare';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

export type Sort =
  | 'new'
  | '-new'
  | 'trending'
  | '-trending'
  | 'popular'
  | '-popular';

export type PublicationStatus = 'draft' | 'published' | 'archived';
export type SelectedPublicationStatus = 'all' | 'published' | 'archived';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  areas?: string[];
  publicationStatuses: PublicationStatus[];
  filterCanModerate?: boolean;
  filteredProjectIds?: string[];
}

interface IQueryParameters {
  'page[number]'?: number;
  'page[size]'?: number;
  sort?: Sort;
  areas?: string[];
  publication_statuses: PublicationStatus[];
  filter_can_moderate?: boolean;
  filter_ids?: string[];
}

interface IAccumulator {
  projects: IProjectData[] | null;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

type children = (renderProps: GetProjectsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetProjectsChildProps = State & {
  onLoadMore: () => void;
  onChangeSorting: (sort: Sort) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangePublicationStatus: (
    publicationStatus: SelectedPublicationStatus
  ) => void;
};

interface State {
  queryParameters: IQueryParameters;
  projectsList: IProjectData[] | undefined | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetProjects extends Component<Props, State> {
  private queryParameters$: BehaviorSubject<IQueryParameters>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        'page[number]': 1,
        'page[size]': props.pageSize || 250,
        sort: props.sort,
        areas: props.areas,
        publication_statuses: props.publicationStatuses,
        filter_can_moderate: props.filterCanModerate,
        filter_ids: props.filteredProjectIds,
      },
      projectsList: undefined,
      hasMore: false,
      querying: true,
      loadingMore: false,
    };

    const queryParameters = this.getQueryParameters(this.state, props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const startAccumulatorValue: IAccumulator = {
      queryParameters,
      projects: null,
      hasMore: false,
    };

    this.subscriptions = [
      this.queryParameters$
        .pipe(
          distinctUntilChanged((x, y) => shallowCompare(x, y)),
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

              return projectsStream({ queryParameters }).observable.pipe(
                map((projects) => {
                  const selfLink = get(projects, 'links.self');
                  const lastLink = get(projects, 'links.last');
                  const hasMore =
                    isString(selfLink) &&
                    isString(lastLink) &&
                    selfLink !== lastLink;

                  if (isNilOrError(projects)) {
                    reportError({
                      message: 'There was an incorrect response for projects',
                      response: projects,
                    });
                  }

                  return {
                    queryParameters,
                    hasMore,
                    projects: !isLoadingMore
                      ? projects.data
                      : [...(acc.projects || []), ...projects.data],
                  };
                })
              );
            },
            startAccumulatorValue
          )
        )
        .subscribe(({ projects, queryParameters, hasMore }) => {
          this.setState({
            queryParameters,
            hasMore,
            projectsList: projects,
            querying: false,
            loadingMore: false,
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
          areas: props.areas,
          publication_statuses: props.publicationStatuses,
          filter_can_moderate: props.filterCanModerate,
          filter_ids: props.filteredProjectIds,
        },
        isNil
      ),
    };
  };

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': (this.state.queryParameters['page[number]'] || 0) + 1,
      });
    }
  };

  handleSortOnChange = (sort: Sort) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort,
      'page[number]': 1,
    });
  };

  handleAreasOnChange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas,
      'page[number]': 1,
    });
  };

  handlePublicationStatusOnChange = (
    publicationStatus: SelectedPublicationStatus
  ) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      publication_statuses:
        publicationStatus === 'all'
          ? ['published', 'archived']
          : [publicationStatus],
      'page[number]': 1,
    });
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeSorting: this.handleSortOnChange,
      onChangeAreas: this.handleAreasOnChange,
      onChangePublicationStatus: this.handlePublicationStatusOnChange,
    });
  }
}
