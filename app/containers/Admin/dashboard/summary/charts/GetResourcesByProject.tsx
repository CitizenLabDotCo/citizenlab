// libraries
import  { PureComponent } from 'react';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import {
  ideasByProjectStream,
  IIdeasByProject,
  commentsByProjectStream,
  ICommentsByProject,
  votesByProjectStream,
  IVotesByProject
} from 'services/stats';

// typings
import { IResource } from '../';

interface Props {
  startAt: string;
  endAt: string;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  selectedResource: IResource;
}

interface State {
  serie: IIdeasByProject | ICommentsByProject | IVotesByProject | null;
}

type children = (renderProps: {
  serie: IIdeasByProject | ICommentsByProject | IVotesByProject | null;
}) => JSX.Element | null;

export default class GetResourcesByProject extends PureComponent<Props, State> {
  startAt$: BehaviorSubject<string | null>;
  endAt$: BehaviorSubject<string | null>;
  currentGroupFilter$: BehaviorSubject<string | null>;
  currentTopicFilter$: BehaviorSubject<string | null>;
  selectedResource$: BehaviorSubject<IResource | null>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
    this.subscriptions = [];
    this.startAt$ = new BehaviorSubject(null);
    this.endAt$ = new BehaviorSubject(null);
    this.selectedResource$ = new BehaviorSubject(null);
    this.currentGroupFilter$ = new BehaviorSubject(null);
    this.currentTopicFilter$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    this.startAt$.next(this.props.startAt);
    this.endAt$.next(this.props.endAt);
    this.selectedResource$.next(this.props.selectedResource);
    this.currentGroupFilter$.next(this.props.currentGroupFilter);
    this.currentTopicFilter$.next(this.props.currentTopicFilter);

    this.subscriptions = [
      combineLatest(
        this.startAt$.pipe(
          filter(startAt => startAt !== null)
        ),
        this.endAt$.pipe(
          filter(endAt => endAt !== null)
        ),
        this.selectedResource$.pipe(
          filter(endAt => endAt !== null)
        ),
        this.currentGroupFilter$,
        this.currentTopicFilter$,
      ).pipe(
        switchMap(([startAt, endAt, selectedResource, currentGroupFilter, currentTopicFilter]) => {
          const queryParameters = {
            startAt,
            endAt,
            group: currentGroupFilter,
            topic: currentTopicFilter,
          };
          if (selectedResource === 'Ideas') {
            return ideasByProjectStream({
              queryParameters
            }).observable;
          } else if (selectedResource === 'Comments') {
            return commentsByProjectStream({
              queryParameters
            }).observable;
          } else {
            return votesByProjectStream({
              queryParameters
            }).observable;
          }
        })
      ).subscribe((serie) => {
        this.setState({ serie });
      })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.startAt !== prevProps.startAt) {
      this.startAt$.next(this.props.startAt);
    }

    if (this.props.endAt !== prevProps.endAt) {
      this.endAt$.next(this.props.endAt);
    }
    if (this.props.currentGroupFilter !== prevProps.currentGroupFilter) {
      this.currentGroupFilter$.next(this.props.currentGroupFilter);
    }

    if (this.props.currentTopicFilter !== prevProps.currentTopicFilter) {
      this.currentTopicFilter$.next(this.props.currentTopicFilter);
    }

    if (this.props.selectedResource !== prevProps.selectedResource) {
      this.selectedResource$.next(this.props.selectedResource);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
    });
  }
}
