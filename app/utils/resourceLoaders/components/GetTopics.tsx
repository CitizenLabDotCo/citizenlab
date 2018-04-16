import React from 'react';
// import shallowCompare from 'utils/shallowCompare';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { ITopicData, topicByIdStream, topicsStream } from 'services/topics';
import { isEqual } from 'lodash';

interface InputProps {
  ids?: string[];
}

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topics: ITopicData[] | null;
}

export type GetTopicsChildProps = ITopicData[] | null;

export default class GetTopics extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topics: null,
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
                ids.map(id => topicByIdStream(id).observable.map(topic => topic.data))
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
