import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ITopicData, topicByIdStream, topicsStream } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

interface InputProps {
  ids?: string[];
}

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topics: ITopicData[] | undefined | null | Error;
}

export type GetTopicsChildProps = ITopicData[] | undefined | null | Error;

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
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next)),
        switchMap(({ ids }) => {
          if (ids) {
            if (ids.length > 0) {
              return combineLatest(
                ids.map(id => {
                  return topicByIdStream(id).observable.pipe(
                    map(topic => {
                      if (isNilOrError(topic)) {
                        reportError({
                          message: 'There was an incorrect response for topic',
                          response: topic
                        });
                      }

                      return topic.data;
                    }
                  ));
                })
              );
            }

            return of(null);
          }

          return topicsStream().observable.pipe(map(topics => topics.data));
        })
      ).subscribe((topics) => {
        this.setState({ topics });
      })
    ];
  }

  componentDidUpdate() {
    this.inputProps$.next({ ids: this.props.ids });
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
