import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { ITopicData, topicByIdStream } from 'services/topics';
import { isString } from 'lodash';

interface InputProps {
  id: string;
}

type children = (renderProps: GetTopicChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topic: ITopicData | null;
}

export type GetTopicChildProps = ITopicData | null;

export default class GetTopic extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topic: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ id }) => isString(id))
        .switchMap(({ id }) => topicByIdStream(id).observable)
        .subscribe((topic) => this.setState({ topic: topic.data }))
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { topic } = this.state;
    return (children as children)(topic);
  }
}
