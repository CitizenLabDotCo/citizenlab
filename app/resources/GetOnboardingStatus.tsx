import { Component } from 'react';
import { Subscription } from 'rxjs';
import { onboardingStatusStream, IOnboardingStatus } from 'services/onboardingStatus';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetOnboardingStatusChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  onboardingStatus: IOnboardingStatus | undefined | null;
}

export type GetOnboardingStatusChildProps = IOnboardingStatus | undefined | null;

export default class GetOnboardingStatus extends Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      onboardingStatus: undefined
    };
  }

  componentDidMount() {
    const onboardingStatus$ = onboardingStatusStream().observable;

    this.subscriptions = [
      onboardingStatus$.subscribe((onboardingStatus) => {
        this.setState({ onboardingStatus: (!isNilOrError(onboardingStatus) ? onboardingStatus.data.attributes : null) });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { onboardingStatus } = this.state;
    return (children as children)(onboardingStatus);
  }
}
