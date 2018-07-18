import React from 'react';
import isEqual from 'lodash/isEqual';
import { Subscription, BehaviorSubject } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ICampaignData, listCampaigns, campaignByIdStream } from 'services/campaigns';

interface InputProps {
  ids?: string[];
}

type children = (renderProps: GetCampaignsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  campaigns: ICampaignData[] | undefined | null | Error;
}

export type GetCampaignsChildProps = ICampaignData[] |undefined |  null | Error;

export default class GetCampaigns extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      campaigns: undefined,
    };
  }

  componentDidMount() {
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next)),
        switchMap(({ ids }) => {
          if (ids) {
            if (ids.length > 0) {
              return combineLatest(
                ids.map(id => campaignByIdStream(id).observable.map(topic => topic.data))
              );
            }

            return of(null);
          }

          return listCampaigns().observable.map(campaigns => campaigns.data);
        })
      )
      .subscribe((campaigns) => {
        this.setState({ campaigns });
      })
    ];
  }

  componentDidUpdate() {
    this.inputProps$.next({ ids: this.props.ids });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { campaigns } = this.state;
    return (children as children)(campaigns);
  }
}
