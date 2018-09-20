import React from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IDeliveryData, listCampaignDeliveries } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  campaignId?: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (renderProps: GetCampaignDeliveriesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  deliveries: IDeliveryData[] | undefined | null;
}

export type GetCampaignDeliveriesChildProps = IDeliveryData[] | undefined | null;

export default class GetCampaignDeliveries extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      deliveries: undefined
    };
  }

  componentDidMount() {
    const { campaignId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ campaignId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ deliveries: undefined })),
        switchMap(({ campaignId }) => campaignId ? listCampaignDeliveries(campaignId).observable : of(null))
      )
        .subscribe((deliveries) => this.setState({ deliveries: !isNilOrError(deliveries) ? deliveries.data : deliveries }))
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
    const { deliveries } = this.state;
    return (children as children)(deliveries);
  }
}
