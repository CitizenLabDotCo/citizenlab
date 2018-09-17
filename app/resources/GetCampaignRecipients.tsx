import React from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IRecipientData, listCampaignRecipients } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  campaignId?: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (renderProps: GetCampaignRecipientsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  recipients: IRecipientData[] | undefined | null;
}

export type GetCampaignRecipientsChildProps = IRecipientData[] | undefined | null;

export default class GetCampaignRecipients extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      recipients: undefined
    };
  }

  componentDidMount() {
    const { campaignId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ campaignId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ recipients: undefined })),
        switchMap(({ campaignId }) => campaignId ? listCampaignRecipients(campaignId).observable : of(null))
      )
        .subscribe((recipients) => this.setState({ recipients: !isNilOrError(recipients) ? recipients.data : recipients }))
    ];
  }

  componentDidUpdate() {
    const { campaignId } = this.props;
    this.inputProps$.next({ campaignId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { recipients } = this.state;
    return (children as children)(recipients);
  }
}
