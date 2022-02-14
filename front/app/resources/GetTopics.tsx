import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import {
  ITopicData,
  topicByIdStream,
  topicsStream,
  Code,
} from 'services/topics';
import { projectAllowedInputTopicsStream } from 'services/projectAllowedInputTopics';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  // Don't use projectId, ids or the query parameters (code, exclude_code, sort) together
  // Only one of the three at a time.
  projectId?: string;
  topicIds?: string[];
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

export type GetTopicsChildProps =
  | (ITopicData | Error)[]
  | undefined
  | null
  | Error;

export default class GetTopics extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topics: undefined,
    };
  }

  componentDidMount() {
    const { topicIds, code, exclude_code, sort, projectId } = this.props;

    this.inputProps$ = new BehaviorSubject({
      topicIds,
      code,
      exclude_code,
      sort,
      projectId,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          switchMap(({ topicIds, code, exclude_code, sort, projectId }) => {
            const queryParameters = { code, exclude_code, sort };

            if (projectId) {
              return projectAllowedInputTopicsStream(projectId).observable.pipe(
                map((topics) =>
                  topics.data
                    .filter((topic) => topic)
                    .map((topic) => topic.relationships.topic.data.id)
                ),
                switchMap((topicIds) => {
                  return combineLatest(
                    topicIds.map((topicId) =>
                      topicByIdStream(topicId).observable.pipe(
                        map((topic) =>
                          !isNilOrError(topic) ? topic.data : topic
                        )
                      )
                    )
                  );
                })
              );
            } else if (topicIds) {
              if (topicIds.length > 0) {
                return combineLatest(
                  topicIds.map((id) => {
                    return topicByIdStream(id).observable.pipe(
                      map((topic) =>
                        !isNilOrError(topic) ? topic.data : topic
                      )
                    );
                  })
                );
              }

              return of(null);
            } else {
              return topicsStream({ queryParameters }).observable.pipe(
                map((topics) => topics.data)
              );
            }
          })
        )
        .subscribe((topics) => {
          this.setState({ topics });
        }),
    ];
  }

  componentDidUpdate() {
    const { topicIds, code, exclude_code, sort, projectId } = this.props;
    this.inputProps$.next({
      topicIds,
      code,
      exclude_code,
      sort,
      projectId,
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { topics } = this.state;
    return (children as children)(topics);
  }
}
