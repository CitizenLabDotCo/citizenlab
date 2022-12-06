import React from 'react';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { IDeliveryData, listCampaignDeliveries } from 'services/campaigns';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import shallowCompare from 'utils/shallowCompare';

interface InputProps {
  campaignId: string;
  pageSize: number;
  pageNumber?: number;
}

type children = (
  renderProps: GetCampaignDeliveriesChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  deliveries: IDeliveryData[] | undefined | null;
  currentPage: number;
  lastPage: number;
}

export type GetCampaignDeliveriesChildProps = State & {
  onChangePage: (pageNumber: number) => void;
};

export default class GetCampaignDeliveries extends React.Component<
  Props,
  State
> {
  private inputProps$: BehaviorSubject<InputProps>;
  private pageChanges$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      deliveries: undefined,
      currentPage: 1,
      lastPage: 1,
    };
  }

  componentDidMount() {
    const { campaignId, pageNumber, pageSize } = this.props;

    this.inputProps$ = new BehaviorSubject({ campaignId, pageSize });
    this.pageChanges$ = new BehaviorSubject(pageNumber || 1);

    this.subscriptions = [
      combineLatest([this.inputProps$, this.pageChanges$])
        .pipe(
          map(([inputProps, pageNumber]) => ({ ...inputProps, pageNumber })),
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ campaignId, pageSize, pageNumber }) => {
            if (campaignId) {
              return listCampaignDeliveries(campaignId, {
                queryParameters: {
                  'page[size]': pageSize,
                  'page[number]': pageNumber,
                },
              }).observable;
            } else {
              return of(null);
            }
          })
        )
        .subscribe((deliveries) => {
          const currentPageNumberFromURL = !isNilOrError(deliveries)
            ? getPageNumberFromUrl(deliveries.links.self)
            : null;
          const lastPageNumberFromURL = !isNilOrError(deliveries)
            ? getPageNumberFromUrl(deliveries.links.last)
            : null;

          this.setState({
            deliveries: !isNilOrError(deliveries)
              ? deliveries.data
              : deliveries,
            currentPage: currentPageNumberFromURL || 1,
            lastPage: lastPageNumberFromURL || 1,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { campaignId, pageSize } = this.props;
    this.inputProps$.next({ campaignId, pageSize });
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
