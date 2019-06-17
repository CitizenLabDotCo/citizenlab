import React from 'react';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, mergeScan, map, switchMap, tap } from 'rxjs/operators';
import { ICommentData, commentsForIdeaStream, CommentsSort } from 'services/comments';
import { unionBy } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

type children = (renderProps: GetCommentsChildProps) => JSX.Element | null;

interface Props {
  ideaId: string;
  children?: children;
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
  private ideaId$: BehaviorSubject<string>;
  private sort$: BehaviorSubject<CommentsSort>;
  private loadMore$: BehaviorSubject<null>;
  private subscription: Subscription;
  private initialQueryParameters: IQueryParameters = {
    pageNumber: 0,
    pageSize: 15,
    sort: '-new'
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      commentsList: undefined,
      loadingInital: false,
      loadingMore: false,
      hasMore: true
    };
  }

  componentDidMount() {
    this.ideaId$ = new BehaviorSubject(this.props.ideaId);
    this.sort$ = new BehaviorSubject(this.initialQueryParameters.sort);
    this.loadMore$ = new BehaviorSubject(null);

    this.subscription = combineLatest(
      this.ideaId$.pipe(distinctUntilChanged()),
      this.sort$.pipe(distinctUntilChanged())
    ).pipe(
      switchMap(([ideaId, sort]) => {
        let commentsList: ICommentData[] | undefined | null | Error = undefined;
        let pageNumber = this.initialQueryParameters.pageNumber;
        const pageSize = this.initialQueryParameters.pageSize;
        let hasMore = true;

        return this.loadMore$.pipe(
          tap(() => this.setState({
            loadingInital: (pageNumber === 0),
            loadingMore: (pageNumber > 0)
           })),
          mergeScan(() => {
            pageNumber = pageNumber + 1;

            return commentsForIdeaStream(ideaId, {
              queryParameters: {
                sort,
                'page[number]': pageNumber,
                'page[size]': pageSize
              }
            }).observable.pipe(
              map((comments) => {
                hasMore = ((pageNumber * pageSize) < comments.meta.total);
                commentsList = !isNilOrError(commentsList) ? unionBy(commentsList, comments.data, 'id') : comments.data;
                return null;
            }));
          }, null),
          map(() => ({ pageNumber, commentsList, hasMore }))
        );
      })
    ).subscribe(({ commentsList, hasMore }) => {
      this.setState({
        commentsList,
        hasMore,
        loadingInital: false,
        loadingMore: false
      });
    });
  }

  componentDidUpdate() {
    this.ideaId$.next(this.props.ideaId);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  loadMore = () => {
    if (this.state.hasMore) {
      this.loadMore$.next(null);
    }
  }

  changeSort = (sort: CommentsSort) => {
    this.sort$.next(sort);
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeSort: this.changeSort
    });
  }
}
