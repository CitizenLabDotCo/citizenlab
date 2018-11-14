// libraries
import React, { PureComponent } from 'react';
import { Subscription, Observable } from 'rxjs';

import {
  ideasByProjectStream,
  IIdeasByProject,
  commentsByProjectStream,
  ICommentsByProject,
  votesByProjectStream,
  IVotesByProject,
  ideasByTopicStream,
  IIdeasByTopic,
  commentsByTopicStream,
  ICommentsByTopic,
  votesByTopicStream,
  IVotesByTopic
} from 'services/stats';

// typings
import { IResource } from '..';

interface Props {
  startAt: string;
  endAt: string;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  currentProjectFilter: string | null;
  selectedResource: IResource;
  type: 'ByProject' | 'ByTopic';
}

interface State {
  serie: IIdeasByProject
  | ICommentsByProject
  | IVotesByProject
  | IIdeasByTopic
  | ICommentsByTopic
  | IVotesByTopic
  | null;
}

type children = (renderProps: {
  serie: IIdeasByProject
  | ICommentsByProject
  | IVotesByProject
  | IIdeasByTopic
  | ICommentsByTopic
  | IVotesByTopic
  | null;
}) => JSX.Element | null;

export default class GetResourcesByProject extends PureComponent<Props, State> {
  subscription: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    const {
      startAt,
      endAt,
      selectedResource,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
      type } = this.props;

    this.resubscribe(
      startAt,
      endAt,
      selectedResource,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
      type);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      startAt,
      endAt,
      selectedResource,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
      type } = this.props;

      if (startAt !== prevProps.startAt
        || endAt !== prevProps.endAt
        || selectedResource !== prevProps.selectedResource
        || currentGroupFilter !== prevProps.currentGroupFilter
        || currentTopicFilter !== prevProps.currentTopicFilter
        || currentProjectFilter !== prevProps.currentProjectFilter
      ) {
        this.resubscribe(
          startAt,
          endAt,
          selectedResource,
          currentGroupFilter,
          currentTopicFilter,
          currentProjectFilter,
          type
        );
      }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  resubscribe(
    startAt: string,
    endAt: string,
    selectedResource: IResource,
    currentGroupFilter: string | null,
    currentTopicFilter: string | null,
    currentProjectFilter: string | null,
    type: 'ByProject' | 'ByTopic',
  ) {

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = getObservable(startAt,
      endAt,
      selectedResource,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
      type).subscribe((serie) => {
        this.setState({ serie });
      });
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
    });
  }
}
const getObservable = (
  startAt,
  endAt,
  selectedResource,
  currentGroupFilter,
  currentTopicFilter,
  currentProjectFilter,
  type) => {
  if (type === 'ByProject') {
    const queryParameters = {
      startAt,
      endAt,
      group: currentGroupFilter,
      topic: currentTopicFilter,
    };
    if (selectedResource === 'Ideas') {
      return ideasByProjectStream({
        queryParameters
      }).observable as Observable<any>;
    } else if (selectedResource === 'Comments') {
      return commentsByProjectStream({
        queryParameters
      }).observable as Observable<any>;
    } else {
      return votesByProjectStream({
        queryParameters
      }).observable as Observable<any>;
    }
  } else {
    const queryParameters = {
      startAt,
      endAt,
      project: currentProjectFilter,
      group: currentGroupFilter,
    };
    if (selectedResource === 'Ideas') {
      return ideasByTopicStream({
        queryParameters
      }).observable as Observable<any>;
    } else if (selectedResource === 'Comments') {
      return commentsByTopicStream({
        queryParameters
      }).observable as Observable<any>;
    } else {
      return votesByTopicStream({
        queryParameters
      }).observable as Observable<any>;
    }
  }
};
