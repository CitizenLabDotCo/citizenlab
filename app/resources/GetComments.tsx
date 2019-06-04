import React from 'react';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, tap, mergeScan, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ICommentData, commentsForIdeaStream } from 'services/comments';
import { isString, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string;
  pageSize?: number; // will default to 10
}

type children = (renderProps: GetCommentsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  commentsList: ICommentData[] | undefined | null | Error;
  querying: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

export interface GetCommentsChildProps extends State {
  onLoadMore: () => void;
}

interface IAccumulator {
  commentsList: ICommentData[] | undefined | null | Error;
  ideaId: string;
  pageNumber: number;
  hasMore: boolean;
}

export default class GetComments extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private pageNumber$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      commentsList: undefined,
      querying: true,
      loadingMore: false,
      hasMore: true
    };
  }

  componentDidMount() {
    const { ideaId, pageSize } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId });
    this.pageNumber$ = new BehaviorSubject(1);

    const startAccumulatorValue: IAccumulator = { ideaId, pageNumber: 1, commentsList: undefined, hasMore: false };

    const parsedInputProps$ = this.inputProps$.pipe(
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      filter(({ ideaId }) => isString(ideaId)),
      tap(() => this.pageNumber$.next(1))
    );
    const parsedPageNumber$ = this.pageNumber$.pipe(
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
    );

    this.subscriptions = [
      combineLatest([
        parsedInputProps$,
        parsedPageNumber$
      ]).pipe(
        mergeScan<[InputProps, number], IAccumulator>((acc, [inputProps, pageNumber]) => {
          const isLoadingMore = acc.ideaId === inputProps.ideaId && acc.pageNumber !== acc.pageNumber;

          this.setState({
            querying: !isLoadingMore,
            loadingMore: isLoadingMore,
          });

          return commentsForIdeaStream(inputProps.ideaId, {
            queryParameters: {
              'page[number]': pageNumber,
              'page[size]': pageSize || 10
            }
          }).observable.pipe(
            map(commentsList => {
              const { loadingMore } = this.state;

              const currentPage = get(commentsList, 'meta.current_page');
              const totalPages = get(commentsList, 'meta.total_pages');
              const hasMore = (Number.isInteger(currentPage) && Number.isInteger(totalPages) && currentPage !== totalPages);

              return {
                ideaId,
                pageNumber,
                hasMore,
                commentsList: (!loadingMore || isNilOrError(acc.commentsList) ? commentsList.data : [...(acc.commentsList || []), ...commentsList.data])
              };
          }));
        }, startAccumulatorValue)
      ).subscribe(({ commentsList, hasMore }) => this.setState({ hasMore, commentsList }))
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
    this.pageNumber$.next(this.pageNumber$.getValue() + 1);
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore
    });
  }
}
