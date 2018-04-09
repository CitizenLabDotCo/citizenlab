import * as React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { IInviteData, invitesStream } from 'services/invites';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {}

interface Props extends InputProps {
  children: (obj: GetInvitesChildProps) => JSX.Element | null;
}

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
type SortDescriptor = { attribute: SortAttribute, direction: SortDirection };
type InviteStatus = 'pending' | 'accepted';

export type GetInvitesChildProps = State & {
  onChangeSorting: (attribute: SortAttribute, direction: SortDirection) => void;
  onChangeSearchTerm: (string) => void;
  onChangePage: (number) => void;
  onChangeFilterInviteStatus: (inviteStatus: InviteStatus) => void;
};

export default class GetInvites extends React.PureComponent<Props, State> {
  searchTerm$: BehaviorSubject<string | null>;
  sortDescriptor$: BehaviorSubject<SortDescriptor>;
  currentPage$: BehaviorSubject<number>;
  inviteStatusFilter$: BehaviorSubject<InviteStatus | null>;
  subscriptions: Subscription[];

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
    this.searchTerm$ = new BehaviorSubject(null);
    this.sortDescriptor$ = new BehaviorSubject({ attribute: 'created_at', direction: 'descending' } as SortDescriptor);
    this.currentPage$ = new BehaviorSubject(1);
    this.inviteStatusFilter$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    this.subscriptions = [
      Observable.combineLatest(
        Observable.combineLatest(
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
    return this.props.children({
      ...this.state,
      onChangeSorting: this.handleChangeSorting,
      onChangeSearchTerm: this.handleChangeSearchTerm,
      onChangePage: this.handleChangePage,
      onChangeFilterInviteStatus: this.handleChangeFilterInviteStatus,
    });
  }
}
