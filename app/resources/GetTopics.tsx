import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ITopicData, topicByIdStream, topicsStream, Code } from 'services/topics';
import { projectTopicsStream } from 'services/projectTopics';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  // todo: make props mutually exclusive, check input component for how to
  projectId?: string;
  ids?: string[];
  code?: Code;
  exclude_code?: Code;
  sort?: 'new' | 'custom';
}

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topics: (ITopicData | Error)[] | undefined | null | Error;
}

export type GetTopicsChildProps = (ITopicData | Error)[] | undefined | null | Error;

export default class GetTopics extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topics: undefined
    };
  }

  componentDidMount() {
    const { ids, code, exclude_code, sort, projectId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids, code, exclude_code, sort, projectId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next)),
        switchMap(({ ids, code, exclude_code, sort, projectId }) => {
          const queryParameters = { code, exclude_code, sort };

          if (projectId) {
            return projectTopicsStream(projectId).observable.pipe(
              map(topics => topics.data.filter(topic => topic).map(topic => topic.relationships.topic.data.id)),
              switchMap((topicIds) => {
                return combineLatest(
                  topicIds.map(topicId => topicByIdStream(topicId).observable.pipe(map(topic => (!isNilOrError(topic) ? topic.data : topic))))
                );
              }),
            );
           } else if (ids && ids.length > 0) {
            return combineLatest(
              ids.map(id => {
                return topicByIdStream(id).observable.pipe(
                  map(topic => !isNilOrError(topic) ? topic.data : topic)
                );
              })
            );
          } else {
            return topicsStream({ queryParameters }).observable.pipe(map(topics => topics.data));
          }
        })
      ).subscribe((topics) => {
        this.setState({ topics });
      })
    ];
  }

  componentDidUpdate() {
    const { ids, code, exclude_code, sort } = this.props;
    this.inputProps$.next({
      ids,
      code,
      exclude_code,
      sort
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { topics } = this.state;
    return (children as children)(topics);
  }
}
