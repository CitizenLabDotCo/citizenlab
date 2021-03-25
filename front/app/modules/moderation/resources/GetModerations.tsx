import React from 'react';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  moderationsStream,
  IModerationData,
  TModerationStatuses,
} from 'modules/moderation/services/moderations';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatuses;
}

type children = (renderProps: GetModerationsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  list: IModerationData[] | undefined | null | Error;
  currentPage: number;
  lastPage: number;
}

export type GetModerationsChildProps = State & {
  onChangePage: (pageNumber: number) => void;
};

export default class GetModerations extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private pageChanges$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  static defaultProps = {
    pageNumber: 1,
    pageSize: 12,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      list: undefined,
      currentPage: 1,
      lastPage: 1,
    };
  }

  componentDidMount() {
    const { pageNumber, pageSize, moderationStatus } = this.props;

    this.inputProps$ = new BehaviorSubject({ pageNumber, pageSize });
    this.pageChanges$ = new BehaviorSubject(pageNumber as number);

    this.subscriptions = [
      combineLatest(this.inputProps$, this.pageChanges$)
        .pipe(
          map(([inputProps, pageNumber]) => ({ ...inputProps, pageNumber })),
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ pageSize, pageNumber }) => {
            return moderationsStream({
              queryParameters: {
                'page[number]': pageNumber,
                'page[size]': pageSize,
                moderation_status: moderationStatus,
              },
            }).observable;
          })
        )
        .subscribe((response) => {
          this.setState({
            list: !isNilOrError(response) ? response.data : response,
            currentPage: getPageNumberFromUrl(response?.links?.self) || 1,
            lastPage: getPageNumberFromUrl(response?.links?.last) || 1,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { pageNumber, pageSize } = this.props;
    this.inputProps$.next({ pageNumber, pageSize });
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
