import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { IInviteData, invitesStream } from 'services/invites';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

type Props = {
  children: (obj: GetInvitesChildProps) => JSX.Element | null;
};

type State = {
  invites: IInviteData[] | null;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
  inviteStatusFilter: InviteStatus | null;
  searchTerm: String | null;
};

type SortAttribute = 'email' | 'last_name' | 'created_at' | 'invite_status';
type SortDirection = 'ascending' | 'descending';
type SortDescriptor = {
  attribute: SortAttribute,
  direction: SortDirection,
};
type InviteStatus = 'pending' | 'accepted';

export type GetInvitesChildProps = State & {
  onChangeSorting: (attribute: SortAttribute, direction: SortDirection) => void;
  onChangeSearchTerm: (string) => void;
  onChangePage: (number) => void;
  onChangeFilterInviteStatus: (inviteStatus: InviteStatus) => void;
};

class GetInvites extends React.PureComponent<Props, State> {
  searchTerm$: Rx.BehaviorSubject<string | null>;
  sortDescriptor$: Rx.BehaviorSubject<SortDescriptor>;
  currentPage$: Rx.BehaviorSubject<number>;
  inviteStatusFilter$: Rx.BehaviorSubject<InviteStatus | null>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      invites: null,
      sortAttribute: 'created_at',
      sortDirection: 'descending',
      currentPage: 1,
      lastPage: 1,
      inviteStatusFilter: null,
      searchTerm: null,
    };
    this.searchTerm$ = new Rx.BehaviorSubject(null);
    this.sortDescriptor$ = new Rx.BehaviorSubject({ attribute: 'created_at', direction: 'descending' } as SortDescriptor);
    this.currentPage$ = new Rx.BehaviorSubject(1);
    this.inviteStatusFilter$ = new Rx.BehaviorSubject(null);
  }

  componentDidMount() {
    this.subscriptions = [
      Rx.Observable.combineLatest(
        Rx.Observable.combineLatest(
          this.inviteStatusFilter$,
          this.searchTerm$.debounceTime(300)
        ).do(() => { this.currentPage$.next(1); }),
        this.sortDescriptor$,
        this.currentPage$.distinctUntilChanged()
      ).switchMap(([[inviteStatusFilter, searchTerm], sortDescriptor, currentPage]) => {
        const queryParameters = {
          'page[number]': currentPage || 1,
          'page[size]': 20,
          sort: `${sortDescriptor.direction === 'ascending' ? '' : '-'}${sortDescriptor.attribute}`,
          search: searchTerm || null,
          invite_status: inviteStatusFilter,
        };
        return invitesStream({ queryParameters, cacheStream: false }).observable.map((invites) => ({
          invites,
          sortDescriptor,
          inviteStatusFilter,
          searchTerm,
        }));
      }).subscribe(({ invites, sortDescriptor, inviteStatusFilter, searchTerm }) => {
        this.setState({
          inviteStatusFilter,
          searchTerm,
          sortAttribute: sortDescriptor.attribute,
          sortDirection: sortDescriptor.direction,
          invites: invites.data,
          currentPage: getPageNumberFromUrl(invites.links.self) || 1,
          lastPage: getPageNumberFromUrl(invites.links.last) || 1,
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleChangeSorting = (attribute: SortAttribute, direction: SortDirection) => {
    this.sortDescriptor$.next({ attribute, direction });
  }

  handleChangeSearchTerm = (searchTerm) => {
    this.searchTerm$.next(searchTerm);
  }

  handleChangePage = (page: number) => {
    this.currentPage$.next(page);
  }

  handleChangeFilterInviteStatus = (inviteStatus: InviteStatus) => {
    this.inviteStatusFilter$.next(inviteStatus);
  }

  render() {
    const renderProps: GetInvitesChildProps = {
      ...this.state,
      onChangeSorting: this.handleChangeSorting,
      onChangeSearchTerm: this.handleChangeSearchTerm,
      onChangePage: this.handleChangePage,
      onChangeFilterInviteStatus: this.handleChangeFilterInviteStatus,
    };
    return this.props.children(renderProps);
  }
}

export default GetInvites;
