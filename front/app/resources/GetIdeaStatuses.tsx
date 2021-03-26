import React from 'react';
import { Subscription } from 'rxjs';
import { IIdeaStatusData, ideaStatusesStream } from 'services/ideaStatuses';

interface InputProps {}

type children = (renderProps: GetIdeaStatusesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaStatuses: IIdeaStatusData[] | undefined | null;
}

export type GetIdeaStatusesChildProps = IIdeaStatusData[] | undefined | null;

export default class GetIdeaStatuses extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaStatuses: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      ideaStatusesStream().observable.subscribe((ideaStatuses) => {
        this.setState({
          ideaStatuses: ideaStatuses ? ideaStatuses.data : null,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaStatuses } = this.state;
    return (children as children)(ideaStatuses);
  }
}
