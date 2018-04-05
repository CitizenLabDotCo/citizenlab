import * as React from 'react';
import { isEqual, get, isString, isEmpty, omitBy, isNil } from 'lodash';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { ideasStream, IIdeas } from 'services/ideas';
import shallowCompare from 'utils/shallowCompare';

export interface IQueryParameters {
  'page[number]'?: number | undefined;
  'page[size]'?: number | undefined;
  project?: string | undefined;
  phase?: string | undefined;
  author?: string | undefined;
  sort?: string | undefined;
  search?: string | undefined;
  topics?: string[] | undefined;
}

interface IAccumulator {
  ideas: IIdeas;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

interface InputProps {
  queryParameters?: IQueryParameters | undefined;
}

interface Props extends InputProps {
  children: (obj: GetIdeasChildProps) => JSX.Element | null;
}

export type GetIdeasChildProps = State & {
  onLoadMore: () => void;
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

export default class IdeaCards extends React.PureComponent<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
  search$: BehaviorSubject<string>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      queryParameters: {
        'page[number]': 1,
        'page[size]': 12,
        sort: 'trending',
        project: undefined,
        phase: undefined,
        author: undefined,
        search: '',
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
    const queryParameters = { ...this.state.queryParameters, ...this.props.queryParameters };
    const startAccumulatorValue: IAccumulator = { queryParameters, ideas: {} as IIdeas, hasMore: false };

    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new BehaviorSubject('');

    const queryParameters$ = this.queryParameters$.distinctUntilChanged((x, y) => shallowCompare(x, y));
    const search$ = this.search$.distinctUntilChanged().do(searchValue => this.setState({ searchValue })).debounceTime(400).startWith('');

    this.subscriptions = [
      Observable.combineLatest(
        queryParameters$,
        search$
      )
      .map(([queryParameters, search]) => ({ ...queryParameters, search }))
      .mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
        const isLoadingMore = (acc.queryParameters['page[number]'] !== queryParameters['page[number]']);
        const search = (isString(queryParameters.search) && !isEmpty(queryParameters.search) ? queryParameters.search : undefined);
        const pageNumber = (isLoadingMore ? queryParameters['page[number]'] : 1);
        const newQueryParameters: IQueryParameters = omitBy({
          ...queryParameters,
          search,
          'page[number]': pageNumber
        }, isNil);

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
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    if (!isEqual(prevProps, this.props)) {
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

  handleSearchOnChange = (search: string) => {
    this.search$.next(search);
  }

  handleSortOnChange = (sort: string) => {
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
    return this.props.children({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeSorting: this.handleSortOnChange,
      onChangeTopics: this.handleTopicsOnChange
    });
  }
}
