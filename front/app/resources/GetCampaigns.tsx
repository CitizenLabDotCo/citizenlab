import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ICampaignData, listCampaigns } from 'services/campaigns';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  campaignNames?: string[];
  withoutCampaignNames?: string[];
  pageSize?: number;
  pageNumber?: number;
}

type children = (renderProps: GetCampaignsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  campaigns: ICampaignData[] | undefined | null | Error;
  currentPage: number;
  lastPage: number;
}

export type GetCampaignsChildProps = State & {
  onChangePage: (pageNumber: number) => void;
};

export default class GetCampaigns extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private pageChanges$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  static defaultProps: Partial<Props> = {
    pageSize: 20,
    pageNumber: 1,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      currentPage: 1,
      lastPage: 1,
      campaigns: undefined,
    };
  }

  componentDidMount() {
    const { campaignNames, withoutCampaignNames, pageSize, pageNumber } =
      this.props;

    this.inputProps$ = new BehaviorSubject({
      campaignNames,
      withoutCampaignNames,
      pageSize,
    });
    this.pageChanges$ = new BehaviorSubject(pageNumber || 1);

    this.subscriptions = [
      combineLatest([this.inputProps$, this.pageChanges$])
        .pipe(
          map(([inputProps, pageNumber]) => ({ ...inputProps, pageNumber })),
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          switchMap(
            ({ campaignNames, withoutCampaignNames, pageSize, pageNumber }) => {
              return listCampaigns({
                queryParameters: {
                  campaign_names: campaignNames,
                  without_campaign_names: withoutCampaignNames,
                  'page[size]': pageSize,
                  'page[number]': pageNumber,
                },
              }).observable;
            }
          )
        )
        .subscribe((campaigns) => {
          this.setState({
            campaigns: campaigns.data,
            currentPage: getPageNumberFromUrl(campaigns.links.self) || 1,
            lastPage: getPageNumberFromUrl(campaigns.links.last) || 1,
          });
        }),
    ];
  }

  componentDidUpdate() {
    this.inputProps$.next({
      campaignNames: this.props.campaignNames,
      withoutCampaignNames: this.props.withoutCampaignNames,
      pageSize: this.props.pageSize,
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleOnPageChange = (pageNumber: number) => {
    this.pageChanges$.next(pageNumber);
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangePage: this.handleOnPageChange,
    });
  }
}
