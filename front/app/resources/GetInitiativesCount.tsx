import React from 'react';
import { isString, isEmpty, isEqual } from 'lodash-es';
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
  tap,
  debounceTime,
  switchMap,
} from 'rxjs/operators';
import { initiativesCount } from 'services/stats';
import shallowCompare from 'utils/shallowCompare';
import { isNilOrError } from 'utils/helperUtils';

export interface InputProps {
  authorId?: string;
  search?: string;
  topics?: string[];
  areas?: string[];
  initiativeStatusId?: string;
  boundingBox?: number[];
  assignee?: string;
  feedbackNeeded?: boolean;
}

interface IQueryParameters {
  author: string | undefined;
  search: string | undefined;
  topics: string[] | undefined;
  areas: string[] | undefined;
  initiative_status: string | undefined;
  bounding_box: number[] | undefined;
  assignee: string | undefined;
  feedback_needed: boolean | undefined;
}

type children = (
  renderProps: GetInitiativesCountChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetInitiativesCountChildProps) => JSX.Element | null;
}

export type GetInitiativesCountChildProps = State & {
  onChangeSearchTerm: (search: string) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeInitiativeStatus: (initiativeStatus: string) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean) => void;
};

interface State {
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  count: number | undefined | null | Error;
  querying: boolean;
}

export default class GetInitiativesCount extends React.Component<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
  search$: Subject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        author: undefined,
        search: undefined,
        topics: undefined,
        areas: undefined,
        initiative_status: undefined,
        bounding_box: undefined,
        assignee: undefined,
        feedback_needed: undefined,
      },
      searchValue: undefined,
      count: undefined,
      querying: true,
    };
    const queryParameters = this.getQueryParameters(this.state, props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const queryParametersInput$ = this.queryParameters$.pipe(
      distinctUntilChanged((x, y) => shallowCompare(x, y))
    );
    const queryParametersSearch$ = queryParametersInput$.pipe(
      map((queryParameters) => queryParameters.search),
      distinctUntilChanged()
    );
    const search$ = merge(
      this.search$.pipe(
        tap((searchValue) => this.setState({ searchValue })),
        debounceTime(500)
      ),
      queryParametersSearch$.pipe(
        tap((searchValue) => this.setState({ searchValue }))
      )
    ).pipe(
      startWith(queryParameters.search),
      map((searchValue) =>
        isString(searchValue) && !isEmpty(searchValue) ? searchValue : undefined
      ),
      distinctUntilChanged()
    );

    const queryParametersOutput$ = combineLatest([
      queryParametersInput$,
      search$,
    ]).pipe(
      map(([queryParameters, search]) => ({ ...queryParameters, search }))
    );

    this.subscriptions = [
      queryParametersOutput$
        .pipe(
          switchMap((queryParameters) => {
            return initiativesCount({
              queryParameters,
            }).observable.pipe(
              map((initiativesCount) => ({ queryParameters, initiativesCount }))
            );
          })
        )
        .subscribe(({ initiativesCount, queryParameters }) => {
          this.setState({
            queryParameters,
            count: isNilOrError(initiativesCount)
              ? initiativesCount
              : initiativesCount.count,
            querying: false,
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
    const inputPropsQueryParameters: IQueryParameters = {
      author: props.authorId,
      search: props.search,
      topics: props.topics,
      areas: props.areas,
      initiative_status: props.initiativeStatusId,
      bounding_box: props.boundingBox,
      assignee: props.assignee,
      feedback_needed: props.feedbackNeeded,
    };

    return {
      ...state.queryParameters,
      ...inputPropsQueryParameters,
    };
  };

  handleSearchOnChange = (search: string) => {
    this.search$.next(search);
  };

  handleTopicsOnChange = (topics: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      topics,
    });
  };

  handleAreasOnchange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas,
    });
  };

  handleInitiativeStatusOnChange = (initiativeStatus: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      initiative_status: initiativeStatus,
    });
  };

  handleAssigneeOnChange = (assignee: string | undefined) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      assignee,
    });
  };

  handleFeedbackFilterOnChange = (feedbackNeeded: boolean) => {
    if (feedbackNeeded === true) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        feedback_needed: true,
      });
    } else if (feedbackNeeded === false) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        feedback_needed: undefined,
      });
    }
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeTopics: this.handleTopicsOnChange,
      onChangeAreas: this.handleAreasOnchange,
      onChangeInitiativeStatus: this.handleInitiativeStatusOnChange,
      onChangeAssignee: this.handleAssigneeOnChange,
      onChangeFeedbackFilter: this.handleFeedbackFilterOnChange,
    });
  }
}
