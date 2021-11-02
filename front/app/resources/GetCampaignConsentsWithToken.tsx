import React from 'react';
import { Subscription, of, BehaviorSubject } from 'rxjs';
import {
  IConsentData,
  consentsWithTokenStream,
  IConsents,
} from 'services/campaignConsents';
import { isNilOrError } from 'utils/helperUtils';
import { switchMap } from 'rxjs/operators';

interface InputProps {}

type children = (
  renderProps: GetCampaignConsentsWithTokenChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
  token: string | null;
}

interface State {
  consents: IConsentData[] | undefined | null | Error;
}

export type GetCampaignConsentsWithTokenChildProps =
  | IConsentData[]
  | undefined
  | null
  | Error;

export default class GetCampaignConsentsWithToken extends React.Component<
  Props,
  State
> {
  private subscriptions: Subscription[];
  private token$: BehaviorSubject<string | null> = new BehaviorSubject(null);

  constructor(props: Props) {
    super(props);
    this.state = {
      consents: undefined,
    };
    this.token$.next(props.token);
  }

  componentDidMount() {
    this.subscriptions = [
      this.token$
        .pipe(
          switchMap((token) => {
            if (token) {
              return consentsWithTokenStream(token).observable;
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
