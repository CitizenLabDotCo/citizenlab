import React from 'react';
import { Subscription } from 'rxjs';
import { IInitiativeStatusData, initiativeStatusesStream } from 'services/initiativeStatuses';

interface InputProps {}

type children = (renderProps: GetInitiativeStatusesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeStatuses: IInitiativeStatusData[] | undefined| null;
}

export type GetInitiativeStatusesChildProps = IInitiativeStatusData[] | undefined| null;

export default class GetInitiativeStatuses extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeStatuses: undefined
    };
  }

  componentDidMount() {
    this.subscriptions = [
      initiativeStatusesStream().observable.subscribe((initiativeStatuses) => {
        this.setState({
          initiativeStatuses: (initiativeStatuses ? initiativeStatuses.data : null),
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiativeStatuses } = this.state;
    return (children as children)(initiativeStatuses);
  }
}
