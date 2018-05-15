import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { ITopicData, topicByIdStream, topicsStream } from 'services/topics';
import { isEqual } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ids?: string[];
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
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => isEqual(prev, next))
        .switchMap(({ ids }) => {
          if (ids) {
            if (ids.length > 0) {
              return Observable.combineLatest(
                ids.map(id => topicByIdStream(id).observable.map(topic => (!isNilOrError(topic) ? topic.data : topic)))
              );
            }

            return Observable.of(null);
          }

          return topicsStream().observable.map(topics => topics.data);
        })
        .subscribe((topics) => {
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
