import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ICommentData, commentsForUserStream, IComments } from 'services/comments';
import { isString, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  userId: string;
}

type children = (renderProps: GetCommentsForUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  commentsList: ICommentData[] | undefined | null | Error;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
  pageNumber: number;
}

export interface GetCommentsForUserChildProps extends State {
  loadMore: () => void;
}

export default class GetCommentsForUser extends React.Component<Props, State> {
  private subscriptions: Subscription[];
  private initialState: State;
  private pageNumber$: BehaviorSubject<number>;

  constructor(props: Props) {
    super(props);
    this.initialState = {
      commentsList: undefined,
      hasMore: false,
      querying: true,
      loadingMore: false,
      pageNumber: 1
    };
    this.state = this.initialState;
    this.pageNumber$ = new BehaviorSubject(1);
  }

  componentDidMount() {
    this.subscriptions = [
      this.pageNumber$.pipe(
        distinctUntilChanged(),
        switchMap(pageNumber => {
          return commentsForUserStream(this.props.userId, {
            queryParameters: {
              'page[number]': pageNumber,
              'page[size]': 5
            }
          }).observable;
        })
      ).subscribe((newComments: IComments) => {
        const selfLink = get(newComments, 'links.self');
        const lastLink = get(newComments, 'links.last');
        const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
        const { querying, commentsList } = this.state;

        if (isNilOrError(newComments)) {
          this.setState({
            hasMore,
            commentsList: newComments,
            loadingMore: false,
            querying: false
          });
        } else {
          this.setState({
            hasMore,
            commentsList: (querying ? newComments.data : [...(!isNilOrError(commentsList) ? commentsList : []), ...newComments.data]),
            loadingMore: false,
            querying: false
          });
        }

      })
    ];
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.setState(this.initialState);
      this.pageNumber$.next(1);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    const incr = this.state.pageNumber + 1;
    this.pageNumber$.next(incr);
    this.setState({ pageNumber: incr });
  }

  render() {
    const { children } = this.props;
    return (children as children)({ loadMore: this.loadMore, ...this.state });
  }
}
