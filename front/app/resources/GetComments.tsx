import React from 'react';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import {
  distinctUntilChanged,
  mergeScan,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  ICommentData,
  commentsForIdeaStream,
  commentsForInitiativeStream,
  CommentsSort,
} from 'services/comments';
import { unionBy, isString, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

type children = (renderProps: GetCommentsChildProps) => JSX.Element | null;

interface Props {
  postId: string;
  children?: children;
  postType: 'idea' | 'initiative';
}

interface State {
  commentsList: ICommentData[] | undefined | null | Error;
  loadingInital: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

interface IQueryParameters {
  pageNumber: number;
  pageSize: number;
  sort: CommentsSort;
}

export interface GetCommentsChildProps extends State {
  onLoadMore: () => void;
  onChangeSort: (sort: CommentsSort) => void;
}

export default class GetComments extends React.Component<Props, State> {
  private postId$: BehaviorSubject<string>;
  private postType$: BehaviorSubject<string>;
  private sort$: BehaviorSubject<CommentsSort>;
  private loadMore$: BehaviorSubject<null>;
  private subscription: Subscription;
  private initialQueryParameters: IQueryParameters = {
    pageNumber: 0,
    pageSize: 15,
    sort: '-new',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      commentsList: undefined,
      loadingInital: false,
      loadingMore: false,
      hasMore: true,
    };
  }

  componentDidMount() {
    this.postId$ = new BehaviorSubject(this.props.postId);
    this.postType$ = new BehaviorSubject(this.props.postType);
    this.sort$ = new BehaviorSubject(this.initialQueryParameters.sort);
    this.loadMore$ = new BehaviorSubject(null);

    this.subscription = combineLatest([
      this.postId$.pipe(distinctUntilChanged()),
      this.postType$.pipe(distinctUntilChanged()),
      this.sort$.pipe(distinctUntilChanged()),
    ])
      .pipe(
        switchMap(([postId, postType, sort]) => {
          let commentsList: ICommentData[] | undefined | null | Error =
            undefined;
          let pageNumber = this.initialQueryParameters.pageNumber;
          const pageSize = this.initialQueryParameters.pageSize;
          let hasMore = true;

          return this.loadMore$.pipe(
            tap(() =>
              this.setState({
                loadingInital: pageNumber === 0,
                loadingMore: pageNumber > 0,
              })
            ),
            mergeScan(() => {
              pageNumber = pageNumber + 1;

              const commentsStream =
                postType === 'idea'
                  ? commentsForIdeaStream
                  : commentsForInitiativeStream;

              return commentsStream(postId, {
                queryParameters: {
                  sort,
                  'page[number]': pageNumber,
                  'page[size]': pageSize,
                },
              }).observable.pipe(
                map((comments) => {
                  const selfLink = get(comments, 'links.self');
                  const lastLink = get(comments, 'links.last');
                  hasMore =
                    isString(selfLink) &&
                    isString(lastLink) &&
                    selfLink !== lastLink;
                  commentsList = !isNilOrError(commentsList)
                    ? unionBy(commentsList, comments.data, 'id')
                    : comments.data;
                  return null;
                })
              );
            }, null),
            map(() => ({ pageNumber, commentsList, hasMore }))
          );
        })
      )
      .subscribe(({ commentsList, hasMore }) => {
        this.setState({
          commentsList,
          hasMore,
          loadingInital: false,
          loadingMore: false,
        });
      });
  }

  componentDidUpdate() {
    this.postId$.next(this.props.postId);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  loadMore = () => {
    if (this.state.hasMore) {
      this.loadMore$.next(null);
    }
  };

  changeSort = (sort: CommentsSort) => {
    this.sort$.next(sort);
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeSort: this.changeSort,
    });
  }
}
