import React from 'react';
import { Subscription } from 'rxjs';
import { IIdeaStatusData, ideaStatusesStream } from 'services/ideaStatuses';

interface InputProps {}

type children = (renderProps: GetIdeaStatusesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaStatuses: IIdeaStatusData[] | null;
}

export type GetIdeaStatusesChildProps = IIdeaStatusData[] | null;

export default class GetIdeaStatuses extends React.PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaStatuses: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      ideaStatusesStream().observable.subscribe((ideaStatuses) => {
        this.setState({
          ideaStatuses: (ideaStatuses ? ideaStatuses.data : null),
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaStatuses } = this.state;
    return (children as children)(ideaStatuses);
  }
}
