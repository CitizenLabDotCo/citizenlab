import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, mergeScan, map, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { omitBy, isNil, get, isString, isEqual } from 'lodash-es';

import { IAdminFeedbackData, adminFeedbackForIdeaStream } from 'services/adminFeedback';

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
}

export type GetAdminFeedbackChildProps = State & {
  onLoadMore: () => void;
};

export default class GetAdminFeedback extends React.Component<Props, State> {
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
        filter(),
        mergeScan<IQueryParameters, IAccumulator>((_acc, queryParameters) => {
          this.setState({
            loadingMore: true,
          });

          return adminFeedbackForIdeaStream(ideaId, { queryParameters }).observable.pipe(
            map(adminFeedback => {
              const selfLink = get(adminFeedback, 'links.self');
              const lastLink = get(adminFeedback, 'links.last');
              const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

              return {
                hasMore,
                queryParameters,
                adminFeedbackPosts: adminFeedback.data,
              };
            })
          );
        }, startAccumulatorValue)
      ).subscribe(({ hasMore, adminFeedbackPosts, queryParameters }) => {
        this.setState({
          hasMore,
          queryParameters,
          adminFeedbackPosts,
          loadingMore: false,
        });
      })
    ];
  }

  componentDidUpdate(prevProps) {
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
