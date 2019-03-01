import React from 'react';
import { get, isString, isNil, isError } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, mergeScan, map, filter, tap } from 'rxjs/operators';
import { IOfficialFeedbackData, IOfficialFeedbacks, officialFeedbacksForIdeaStream } from 'services/officialFeedback';

export interface InputProps {
  ideaId: string | null;
}

interface IAccumulator {
  hasMore: boolean;
  officialFeedbackList: IOfficialFeedbackData[] | null | Error;
}

type children = (renderProps: GetOfficialFeedbackChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetOfficialFeedbackChildProps = State & {
  onLoadMore: () => void;
};

interface State {
  pageNumber: number;
  officialFeedbackList: IOfficialFeedbackData[] | null | Error;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetOfficialFeedback extends React.Component<Props, State> {
  private initialState: State;
  private ideaId$: BehaviorSubject<string | null>;
  private pageNumber$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    const initialState = {
      pageNumber: 1,
      officialFeedbackList: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.initialState = initialState;
    this.state = initialState;
    this.ideaId$ = new BehaviorSubject(props.ideaId);
    this.pageNumber$ = new BehaviorSubject(initialState.pageNumber);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      this.ideaId$.pipe(
        distinctUntilChanged(),
        filter(ideaId => isString(ideaId)),
        tap(() => this.setState(this.initialState)),
        switchMap((ideaId) => {
          return this.pageNumber$.pipe(
            distinctUntilChanged(),
            mergeScan<number, IAccumulator>((acc, pageNumber) => {
              const isLoadingMore = (pageNumber !== 1);
              const queryParameters = {
                'page[number]': pageNumber,
                'page[size]': 1
              };

              this.setState({
                querying: !isLoadingMore,
                loadingMore: isLoadingMore,
              });

              return officialFeedbacksForIdeaStream(ideaId as string, { queryParameters }).observable.pipe(
                map((officialFeedback: IOfficialFeedbacks | Error) => {
                  const selfLink = get(officialFeedback, 'links.self');
                  const lastLink = get(officialFeedback, 'links.last');
                  const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
                  let officialFeedbackList: IOfficialFeedbackData[] | null | Error = null;

                  if (isError(officialFeedback)) {
                    officialFeedbackList = officialFeedback;
                  } else if (isError(acc.officialFeedbackList)) {
                    officialFeedbackList = acc.officialFeedbackList;
                  } else if (isLoadingMore && !isNil(acc.officialFeedbackList)) {
                    officialFeedbackList = [...acc.officialFeedbackList, ...officialFeedback.data];
                  } else {
                    officialFeedbackList = officialFeedback.data;
                  }

                  return {
                    officialFeedbackList,
                    hasMore
                  };
                })
              );
            }, {
              officialFeedbackList: null,
              hasMore: false
            })
          );
        })
      ).subscribe(({ hasMore, officialFeedbackList }) => {
        this.setState({
          hasMore,
          officialFeedbackList,
          querying: false,
          loadingMore: false
        });
      })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.ideaId !== prevProps.ideaId) {
      this.pageNumber$.next(1);
      this.ideaId$.next(this.props.ideaId);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    if (!this.state.loadingMore && this.state.hasMore) {
      const pageNumber = this.pageNumber$.getValue();
      this.pageNumber$.next(pageNumber + 1);
    }
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore
    });
  }
}
