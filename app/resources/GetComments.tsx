import React from 'react';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, tap, mergeScan, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ICommentData, commentsForIdeaStream, CommentsSort } from 'services/comments';
import { isString, get, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';

interface InputProps {
  ideaId: string;
  pageSize: number; // can be undefined, will default to 10
  sort: CommentsSort; // can be undefined, will default to '-new' ie oldest to newest
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
  onChangeSort: (sort: CommentsSort) => void;
  onChangePageSize: (pageSize: number) => void;
}

interface IAccumulator {
  commentsList: ICommentData[] | undefined | null | Error;
  inputProps: InputProps;
  pageNumber: number;
  hasMore: boolean;
}

export default class GetComments extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private pageNumber$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  static defaultProps = {
    pageSize: 5,
    sort: '-new'
  };

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
    const { children, ...didMountInputProps } = this.props;

    this.inputProps$ = new BehaviorSubject(didMountInputProps);
    this.pageNumber$ = new BehaviorSubject(1);

    const startAccumulatorValue: IAccumulator = {
      inputProps: didMountInputProps,
      pageNumber: 1,
      commentsList: undefined,
      hasMore: false
    };

    const parsedInputProps$ = this.inputProps$.pipe(
      distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
      filter(({ ideaId }) => isString(ideaId)),
      tap(() => this.pageNumber$.next(1))
    );

    this.subscriptions = [
      combineLatest([
        parsedInputProps$,
        this.pageNumber$
      ]).pipe(
        mergeScan<[InputProps, number], IAccumulator>((acc, [inputProps, pageNumber]) => {
          const isLoadingMore = isEqual(acc.inputProps, inputProps) && acc.pageNumber !== pageNumber;

          this.setState({
            querying: !isLoadingMore,
            loadingMore: isLoadingMore,
          });

          return commentsForIdeaStream(inputProps.ideaId, {
            queryParameters: {
              'page[number]': pageNumber,
              'page[size]': inputProps.pageSize,
              sort: inputProps.sort
            }
          }).observable.pipe(
            map(commentsList => {
              const { loadingMore } = this.state;

              const totalTopComments = get(commentsList, 'meta.total');
              const hasMore = (Number.isInteger(totalTopComments) && (pageNumber * inputProps.pageSize) < totalTopComments);

              return {
                inputProps,
                pageNumber,
                hasMore,
                commentsList: !loadingMore || isNilOrError(acc.commentsList)
                  ? commentsList.data
                  : [...(acc.commentsList), ...commentsList.data]
              };
          }));
        }, startAccumulatorValue)
      ).subscribe(({ commentsList, hasMore }) => {
        if (!hasMore) {
          eventEmitter.emit('GetComments', 'LoadedAllComments', null);
        }
        this.setState({ hasMore, commentsList, loadingMore: false, querying: false });
      })
    ];
  }

  componentDidUpdate(prevProps) {
    const { ideaId: nextIdeaId, pageSize: nextPageSize, sort: nextSort } = this.props;
    const { ideaId: prevIdeaId, pageSize: prevPageSize, sort: prevSort } = prevProps;

    const changedProps = {} as Partial<InputProps>;

    if (prevIdeaId !== nextIdeaId) {
      changedProps.ideaId = nextIdeaId;
    }
    if (prevPageSize !== nextPageSize) {
      changedProps.pageSize = nextPageSize;
    }
    if (prevSort !== nextSort) {
      changedProps.sort = nextSort;
    }

    if (Object.keys(changedProps).length > 0) {
      const propsInStream = this.inputProps$.getValue();
      this.inputProps$.next({ ...propsInStream, ...changedProps });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    this.pageNumber$.next(this.pageNumber$.getValue() + 1);
  }

  changeSort = (sort: CommentsSort) => {
    this.inputProps$.next({ ...this.props, sort });
  }

  changePageSize = (pageSize: number) => {
    this.inputProps$.next({ ...this.props, pageSize });
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeSort: this.changeSort,
      onChangePageSize: this.changePageSize
    });
  }
}
