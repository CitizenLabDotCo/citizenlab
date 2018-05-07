import React from 'react';
import { isEqual, get, isString, omitBy, isNil } from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { projectsStream, IProjectData } from 'services/projects';
import shallowCompare from 'utils/shallowCompare';

export type SortAttribute = 'new' | 'trending' | 'popular';
export type Sort =  'new' | '-new' | 'trending' | '-trending' | 'popular' | '-popular';
export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  areas?: string[];
  topics?: string[];
  publicationStatus?: PublicationStatus;
  publicationStatuses?: PublicationStatus[];
  hideAllFilters?: boolean;
}

interface IQueryParameters {
  'page[number]'?: number;
  'page[size]'?: number;
  sort?: Sort;
  areas?: string[];
  topics?: string[];
  publication_status?: PublicationStatus;
  publication_statuses?: PublicationStatus[];
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
  onChangeTopics: (topics: string[]) => void;
};

interface State {
  queryParameters: IQueryParameters;
  projectsList: IProjectData[] | undefined | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetProjects extends React.Component<Props, State> {
  private queryParameters$: BehaviorSubject<IQueryParameters>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        'page[number]': 1,
        'page[size]': this.props.pageSize,
        sort: this.props.sort,
        areas: undefined,
        topics: undefined,
        publication_status: undefined,
        publication_statuses: undefined
      },
      projectsList: undefined,
      hasMore: false,
      querying: true,
      loadingMore: false
    };

    const queryParameters = this.getQueryParameters(this.state, this.props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const startAccumulatorValue: IAccumulator = { queryParameters, projects: null, hasMore: false };

    this.subscriptions = [
      this.queryParameters$
        .distinctUntilChanged((x, y) => shallowCompare(x, y))
        .mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
          const isLoadingMore = (acc.queryParameters['page[number]'] !== queryParameters['page[number]']);
          const pageNumber = (isLoadingMore ? queryParameters['page[number]'] : 1);
          const newQueryParameters: IQueryParameters = {
            ...queryParameters,
            'page[number]': pageNumber
          };

          this.setState({
            querying: !isLoadingMore,
            loadingMore: isLoadingMore,
          });

          return projectsStream({ queryParameters: newQueryParameters }).observable.map((projects) => {
            const selfLink = get(projects, 'links.self');
            const lastLink = get(projects, 'links.last');
            const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

            return {
              queryParameters,
              hasMore,
              projects: (!isLoadingMore ? projects.data : [...(acc.projects || []), ...projects.data])
            };
          });
        }, startAccumulatorValue).subscribe(({ projects, queryParameters, hasMore }) => {
          this.setState({ queryParameters, hasMore, projectsList: projects, querying: false, loadingMore: false });
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
        areas: props.areas,
        topics: props.topics,
        publication_status: props.publicationStatus,
        publication_statuses: props.publicationStatuses,
      }, isNil)
    };
  }

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': (this.state.queryParameters['page[number]'] || 0) + 1
      });
    }
  }

  handleSortOnChange = (sort: Sort) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort
    });
  }

  handleAreasOnChange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas
    });
  }

  handleTopicsOnChange = (topics: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      topics
    });
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeSorting: this.handleSortOnChange,
      onChangeAreas: this.handleAreasOnChange,
      onChangeTopics: this.handleTopicsOnChange
    });
  }
}
