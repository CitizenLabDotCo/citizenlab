import { isString } from 'lodash-es';
import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { campaignByIdStream, ICampaignData } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';

interface InputProps {
  id: string;
}

type children = (renderProps: GetCampaignChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  campaign: ICampaignData | undefined | null | Error;
}

export type GetCampaignChildProps = ICampaignData | undefined | null | Error;

export default class GetCampaign extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      campaign: undefined,
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ id }) => isString(id)),
          switchMap(({ id }) => campaignByIdStream(id).observable)
        )
        .subscribe((campaign) =>
          this.setState({
            campaign: !isNilOrError(campaign) ? campaign.data : campaign,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { campaign } = this.state;
    return (children as children)(campaign);
  }
}
