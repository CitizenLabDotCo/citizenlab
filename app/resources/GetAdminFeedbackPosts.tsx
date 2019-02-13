import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, scan, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { isString, omitBy, isNil } from 'lodash-es';

import { isNilOrError } from 'utils/helperUtils';
import { IAdminFeedbackData, adminFeedbackForIdeaStream } from 'services/adminFeedback';
import { start } from 'repl';

interface InputProps {
  pageNumber?: number;
  pageSize: number;
  ideaId: string;
}

type children = (renderProps: GetAdminFeedbackChildProps) => JSX.Element | null;

interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
}

interface IAccumulator {
  adminFeedbackPosts: IAdminFeedbackData[] | null;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

interface Props extends InputProps {
  children?: children;
}

interface State {
  queryParameters: IQueryParameters;
  adminFeedbackPosts: IAdminFeedbackData[] | undefined | null | Error;
  loadingMore: boolean;
  hasMore: boolean;
  querying: boolean;
}

export type GetAdminFeedbackChildProps = State & {
  onLoadMore: () => void;
};

export default class GetAdminFeedbackPosts extends React.Component<Props, State> {
  private queryParameters$: BehaviorSubject<IQueryParameters>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      queryParameters: {
        'page[number]': 1,
        'page[size]': this.props.pageSize,
      },
      adminFeedbackPosts: undefined,
      loadingMore: false,
      hasMore: false,
      querying: false
    };

    const queryParameters = this.getQueryParameters(this.state, this.props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
  }

  componentDidMount() {
    const { ideaId } = this.props;
    const queryParameters = this.getQueryParameters(this.state, this.props);

    const startAccumulatorValue: IAccumulator = { queryParameters, adminFeedbackPosts: null, hasMore: false };

    this.subscriptions = [
      this.queryParameters$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        switchMap(queryParameters => {
          return adminFeedbackForIdeaStream(ideaId, { queryParameters }).observable
        })
      ).subscribe(({ adminFeedbackPosts, hasMore }) => {
        this.setState({
          hasMore,
          queryParameters,
          adminFeedbackPosts,
          loadingMore: false,
        });
      })
      // this.inputProps$.pipe(
      //   distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      //   filter(({ ideaId }) => isString(ideaId)),
      //   switchMap(({ ideaId }: { ideaId: string }) => adminFeedbackForIdeaStream(ideaId).observable)
      // )
      // .subscribe((adminFeedbackPosts) => this.setState({ adminFeedbackPosts: !isNilOrError(adminFeedbackPosts) ? adminFeedbackPosts.data : adminFeedbackPosts }))
    ];
  }

  componentDidUpdate() {
    const { ideaId } = this.props;
    this.inputProps$.next({ ideaId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': this.state.queryParameters['page[number]'] + 1
      });
    }
  }

  getQueryParameters = (state: State, props: Props) => {
    const inputPropsQueryParameters: IQueryParameters = {
      'page[number]': props.pageNumber as number,
      'page[size]': props.pageSize,
    };

    return ({
      ...state.queryParameters,
      ...omitBy(inputPropsQueryParameters, isNil)
    });
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
    });
  }
}
