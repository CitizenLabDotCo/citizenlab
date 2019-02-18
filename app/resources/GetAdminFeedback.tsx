import React from 'react';
import { get, isString, isNil, isError } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, mergeScan, map, filter, tap } from 'rxjs/operators';
import { IAdminFeedback, IAdminFeedbackData, adminFeedbackForIdeaStream } from 'services/adminFeedback';

export interface InputProps {
  ideaId?: string | null;
}

interface IAccumulator {
  ideaId?: string | null;
  pageNumber?: number;
  pageSize?: number;
  adminFeedbackList: IAdminFeedbackData[] | undefined | null | Error;
  hasMore: boolean;
}

type children = (renderProps: GetAdminFeedbackChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetAdminFeedbackChildProps = State & {
  onLoadMore: () => void;
};

interface State {
  ideaId?: string | null;
  pageNumber?: number;
  adminFeedbackList: IAdminFeedbackData[] | undefined | null | Error;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetAdminFeedback extends React.Component<Props, State> {
  private initialState: State;
  private ideaId$: BehaviorSubject<string | null | undefined>;
  private pageNumber$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    const initialState = {
      pageNumber: 1,
      adminFeedbackList: null,
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
                'page[size]': 10
              };

              this.setState({
                querying: !isLoadingMore,
                loadingMore: isLoadingMore,
              });

              return adminFeedbackForIdeaStream(ideaId as string, { queryParameters }).observable.pipe(
                map((adminFeedback: IAdminFeedback | Error) => {
                  const selfLink = get(adminFeedback, 'links.self');
                  const lastLink = get(adminFeedback, 'links.last');
                  const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
                  const accAdminFeedbackList = acc.adminFeedbackList;
                  let adminFeedbackList: IAdminFeedbackData[] | undefined | null | Error = undefined;

                  if (isError(adminFeedback)) {
                    adminFeedbackList = adminFeedback;
                  } else if (isError(accAdminFeedbackList)) {
                    adminFeedbackList = accAdminFeedbackList;
                  } else if (isLoadingMore && !isNil(accAdminFeedbackList)) {
                    adminFeedbackList = [...accAdminFeedbackList, ...adminFeedback.data];
                  } else {
                    adminFeedbackList = adminFeedback.data;
                  }

                  return {
                    ideaId,
                    hasMore,
                    adminFeedbackList
                  };
                })
              );
            }, {
              ideaId: null,
              pageNumber: 1,
              adminFeedbackList: null,
              hasMore: false
            })
          );
        })
      ).subscribe(({ ideaId, hasMore, adminFeedbackList }) => {
        this.setState({
          ideaId,
          hasMore,
          adminFeedbackList,
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
    if (!this.state.loadingMore) {
      const pageNumber = (this.state.pageNumber || 0) + 1;
      this.pageNumber$.next(pageNumber);
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
