import { Component } from 'react';
import { Subscription } from 'rxjs';
import {
  currentOnboardingCampaignsStream,
  IOnboardingCampaigns,
} from 'services/onboardingCampaigns';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (
  renderProps: GetOnboardingCampaignsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  onboardingCampaigns: IOnboardingCampaigns | undefined | null;
}

export type GetOnboardingCampaignsChildProps =
  | IOnboardingCampaigns
  | undefined
  | null;

export default class GetOnboardingCampaigns extends Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      onboardingCampaigns: undefined,
    };
  }

  componentDidMount() {
    const onboardingCampaigns$ = currentOnboardingCampaignsStream().observable;

    this.subscriptions = [
      onboardingCampaigns$.subscribe((onboardingCampaigns) => {
        this.setState({
          onboardingCampaigns: !isNilOrError(onboardingCampaigns)
            ? onboardingCampaigns.data.attributes
            : null,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { onboardingCampaigns } = this.state;
    return (children as children)(onboardingCampaigns);
  }
}
