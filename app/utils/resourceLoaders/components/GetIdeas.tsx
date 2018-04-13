import React from 'react';
import { get, isString, isEmpty, omit, omitBy, isNil, isEqual } from 'lodash';
import { BehaviorSubject, Subject, Subscription, Observable } from 'rxjs/Rx';
import { ideasStream, IIdeas } from 'services/ideas';
import shallowCompare from 'utils/shallowCompare';

type Sort =  'new' | '-new' | 'trending' | '-trending' | 'popular' | '-popular' | 'author_name' | '-author_name' | 'upvotes_count' | '-upvotes_count' | 'downvotes_count' | '-downvotes_count' | 'status' | '-status';

export interface InputProps {
  type?: 'load-more' | 'paginated';
  pageNumber?: number;
  pageSize?: number;
  projectId?: string;
  phaseId?: string;
  authorId?: string;
  sort?: Sort;
  search?: string;
  topics?: string[];
}

interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  project: string | undefined;
  phase: string | undefined;
  author: string | undefined;
  sort: Sort;
  search: string | undefined;
  topics: string[] | undefined;
}

interface IAccumulator {
  ideas: IIdeas;
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
  onChangeSearchTerm: (search: string) => void;
  onChangeSorting: (sort: string) => void;
  onChangeTopics: (topics: string[]) => void
};

interface State {
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  ideas: IIdeas | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetIdeas extends React.PureComponent<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
  search$: Subject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        'page[number]': 1,
        'page[size]': 12,
        sort: 'trending',
        project: undefined,
        phase: undefined,
        author: undefined,
        search: undefined,
        topics: undefined
      },
      searchValue: undefined,
      ideas: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const startAccumulatorValue: IAccumulator = { queryParameters, ideas: {} as IIdeas, hasMore: false };

    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new Subject();

    const queryParametersInput$ = this.queryParameters$.distinctUntilChanged((x, y) => shallowCompare(x, y));
    const queryParametersSearch$ = queryParametersInput$.map(queryParameters => queryParameters.search).distinctUntilChanged();
    const search$ = Observable.merge(
      this.search$.do(searchValue => this.setState({ searchValue })).debounceTime(500),
      queryParametersSearch$.do(searchValue => this.setState({ searchValue }))
    )
    .startWith(queryParameters.search)
    .map(searchValue => ((isString(searchValue) && !isEmpty(searchValue)) ? searchValue : undefined))
    .distinctUntilChanged();

    const queryParametersOutput$ = Observable.combineLatest(
      queryParametersInput$,
      search$
    ).map(([queryParameters, search]) => ({ ...queryParameters, search }));

    if (!this.props.type || this.props.type === 'load-more') {
      this.subscriptions = [
        queryParametersOutput$.mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
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

          return ideasStream({ queryParameters: newQueryParameters }).observable.map((ideas) => {
            const selfLink = get(ideas, 'links.self');
            const lastLink = get(ideas, 'links.last');
            const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

            return {
              queryParameters,
              hasMore,
              ideas: (!isLoadingMore ? ideas : { data: [...acc.ideas.data, ...ideas.data] }) as IIdeas
            };
          });
        }, startAccumulatorValue).subscribe(({ ideas, queryParameters, hasMore }) => {
          this.setState({ ideas, queryParameters, hasMore, querying: false, loadingMore: false });
        })
      ];
    } else {
      this.subscriptions = [
        queryParametersOutput$.switchMap((queryParameters) => {
          const oldPartialQuery = omit(this.state.queryParameters, 'page[number]');
          const newPartialQuery = omit(queryParameters, 'page[number]');
          queryParameters['page[number]'] = (!isEqual(oldPartialQuery, newPartialQuery) ? 1 : queryParameters['page[number]']);
          return ideasStream({ queryParameters, cacheStream: false }).observable.map(ideas => ({ ideas, queryParameters }));
        })
        .subscribe(({ ideas, queryParameters }) => {
          this.setState({ ideas, queryParameters, querying: false, loadingMore: false });
        })
      ];
    }
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
        project: props.projectId,
        phase: props.phaseId,
        author: props.authorId,
        sort: props.sort,
        search: props.search,
        topics: props.topics
      }, isNil)
    };
  }

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': this.state.queryParameters['page[number]'] + 1
      });
    }
  }

  handleChangePage = (pageNumber: number) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      'page[number]': pageNumber
    });
  }

  handleSearchOnChange = (search: string) => {
    this.search$.next(search);
  }

  handleSortOnChange = (sort: Sort) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort
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
      onChangePage: this.handleChangePage,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeSorting: this.handleSortOnChange,
      onChangeTopics: this.handleTopicsOnChange
    });
  }
}
