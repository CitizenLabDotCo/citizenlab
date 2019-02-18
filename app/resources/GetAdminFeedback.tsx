import React from 'react';
import { get, isString, isNil, isError, isEqual } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, mergeScan, map, filter } from 'rxjs/operators';
import { IAdminFeedback, IAdminFeedbackData, adminFeedbackForIdeaStream } from 'services/adminFeedback';
import shallowCompare from 'utils/shallowCompare';

export interface InputProps {
  ideaId?: string | null;
  pageNumber?: number;
  pageSize?: number;
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

interface State extends InputProps {
  adminFeedbackList: IAdminFeedbackData[] | undefined | null | Error;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetAdminFeedback extends React.Component<Props, State> {
  private initialState: State;
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    const initialState = {
      ideaId: props.ideaId || null,
      pageNumber: props.pageNumber || 1,
      pageSize: props.pageSize || 10,
      adminFeedbackList: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.initialState = initialState;
    this.state = initialState;

    const { ideaId, pageNumber, pageSize } = props;
    this.inputProps$ = new BehaviorSubject({ ideaId, pageNumber, pageSize });
    this.subscriptions = [];
  }

  componentDidMount() {
    const startAccumulatorValue: IAccumulator = {
      ideaId: this.initialState.ideaId,
      pageNumber: this.initialState.pageNumber,
      pageSize: this.initialState.pageSize,
      adminFeedbackList: this.initialState.adminFeedbackList,
      hasMore: this.initialState.hasMore
    };

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((x, y) => shallowCompare(x, y)),
        filter(({ ideaId }) => isString(ideaId)),
        mergeScan<InputProps, IAccumulator>((acc, inputProps) => {
          const oldInputPropsWithoutPageNumber = { ideaId: acc.ideaId, pageSize: acc.pageSize };
          const newInputPropsWithoutPageNumber = { ideaId: inputProps.ideaId, pageSize: inputProps.pageSize };
          const oldPageNumber = acc.pageNumber;
          const newPageNumber = inputProps.pageNumber;
          const isLoadingMore = isEqual(oldInputPropsWithoutPageNumber, newInputPropsWithoutPageNumber) && oldPageNumber !== newPageNumber;
          const pageNumber = (isLoadingMore ? inputProps.pageNumber : 1);
          const queryParameters = {
            'page[number]': pageNumber,
            'page[size]': inputProps.pageSize
          };

          this.setState({
            querying: !isLoadingMore,
            loadingMore: isLoadingMore,
          });

          return adminFeedbackForIdeaStream(inputProps.ideaId as string, { queryParameters }).observable.pipe(
            map((adminFeedback: IAdminFeedback | Error) => {
              const { ideaId, pageSize } = inputProps;
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
                pageNumber,
                pageSize,
                hasMore,
                adminFeedbackList
              };
            })
          );
        }, startAccumulatorValue)
      ).subscribe(({ ideaId, pageNumber, pageSize, hasMore, adminFeedbackList }) => {
        this.setState({
          ideaId,
          pageNumber,
          pageSize,
          hasMore,
          adminFeedbackList,
          querying: false,
          loadingMore: false
        });
      })
    ];
  }

  componentDidUpdate() {
    const { ideaId, pageNumber, pageSize } = this.props;
    this.inputProps$.next({ ideaId, pageNumber, pageSize });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    if (!this.state.loadingMore) {
      const { ideaId, pageSize } = this.state;
      const pageNumber = (this.state.pageNumber || 0) + 1;
      this.inputProps$.next({ ideaId, pageNumber, pageSize });
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
