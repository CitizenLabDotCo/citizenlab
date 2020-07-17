import React from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ICampaignStats, getCampaignStats } from 'services/campaigns';

interface InputProps {
  campaignId: string;
}

type children = (renderProps: GetCampaignStatsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  stats: ICampaignStats | undefined | null | Error;
}

export type GetCampaignStatsChildProps =
  | ICampaignStats
  | undefined
  | null
  | Error;

export default class GetCampaignStats extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      stats: undefined,
    };
  }

  componentDidMount() {
    const { campaignId } = this.props;

    this.inputProps$ = new BehaviorSubject({ campaignId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ campaignId }) => isString(campaignId)),
          switchMap(({ campaignId }) => getCampaignStats(campaignId).observable)
        )
        .subscribe((stats) => this.setState({ stats })),
    ];
  }

  componentDidUpdate() {
    const { campaignId } = this.props;
    this.inputProps$.next({ campaignId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { stats } = this.state;
    return (children as children)(stats);
  }
}
