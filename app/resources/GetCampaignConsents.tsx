import React from 'react';
import { Subscription, of } from 'rxjs';
import {
  IConsentData,
  consentsStream,
  IConsents,
} from 'services/campaignConsents';
import { isNilOrError } from 'utils/helperUtils';
import { authUserStream } from 'services/auth';
import { switchMap } from 'rxjs/operators';

interface InputProps {}

type children = (
  renderProps: GetCampaignConsentsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  consents: IConsentData[] | undefined | null | Error;
}

export type GetCampaignConsentsChildProps =
  | IConsentData[]
  | undefined
  | null
  | Error;

export default class GetConsents extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      consents: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      authUserStream()
        .observable.pipe(
          switchMap((user) => {
            if (!isNilOrError(user)) {
              return consentsStream().observable;
            } else {
              return of(null);
            }
          })
        )
        .subscribe((consents: IConsents) => {
          this.setState({
            consents: !isNilOrError(consents) ? consents.data : consents,
          });
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { consents } = this.state;
    return (children as children)(consents);
  }
}
