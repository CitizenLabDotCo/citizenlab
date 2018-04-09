import React from 'react';
import { isEqual, get, isString, omitBy, isNil } from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { projectsStream, IProjects } from 'services/projects';
import shallowCompare from 'utils/shallowCompare';

export interface IQueryParameters {
  'page[number]'?: number | undefined;
  'page[size]'?: number | undefined;
  areas?: string[] | undefined;
}

interface IAccumulator {
  projects: IProjects;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

interface InputProps {
  queryParameters?: IQueryParameters | undefined;
  hideAllFilters?: boolean | undefined;
}

interface Props extends InputProps {
  children: (obj: GetProjectsChildProps) => JSX.Element | null;
}

export type GetProjectsChildProps = State & {
  onLoadMore: () => void;
  onChangeAreas: (areas: string[]) => void;
};

interface State {
  queryParameters: IQueryParameters;
  projects: IProjects | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetProjects extends React.PureComponent<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      queryParameters: {
        'page[number]': 1,
        'page[size]': 12,
        areas: []
      },
      projects: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = { ...this.state.queryParameters, ...this.props.queryParameters };
    const startAccumulatorValue: IAccumulator = { queryParameters, projects: {} as IProjects, hasMore: false };

    this.queryParameters$ = new BehaviorSubject(queryParameters);

    this.subscriptions = [
      this.queryParameters$
        .distinctUntilChanged((x, y) => shallowCompare(x, y))
        .mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
          const isLoadingMore = (acc.queryParameters['page[number]'] !== queryParameters['page[number]']);
          const pageNumber = (isLoadingMore ? queryParameters['page[number]'] : 1);
          const newQueryParameters: IQueryParameters = omitBy({
            ...queryParameters,
            'page[number]': pageNumber
          }, isNil);

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
              projects: (!isLoadingMore ? projects : { data: [...acc.projects.data, ...projects.data] }) as IProjects
            };
          });
        }, startAccumulatorValue).subscribe(({ projects, queryParameters, hasMore }) => {
          this.setState({ projects, queryParameters, hasMore, querying: false, loadingMore: false });
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

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': (this.state.queryParameters['page[number]'] as number) + 1
      });
    }
  }

  handleAreasOnChange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas
    });
  }

  render() {
    return this.props.children({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeAreas: this.handleAreasOnChange
    });
  }
}
