import React from 'react';
import { Subscription } from 'rxjs';
import { ITopicData, topicsStream } from 'services/topics';

interface InputProps {}

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topics: ITopicData[] | null;
}

export type GetTopicsChildProps = ITopicData[] | null;

export default class GetTopics extends React.PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topics: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      topicsStream().observable.subscribe((topics) => {
        this.setState({
          topics: (topics ? topics.data : null),
        });
      })
    ];
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
