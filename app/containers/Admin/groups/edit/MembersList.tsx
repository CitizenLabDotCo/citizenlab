// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listMembership, Membership } from 'services/groups';
import { userByIdStream, IUserData } from 'services/users';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';

// Style
import styled from 'styled-components';

const EmptyStateMessage = styled.p`
  background: rgba(1, 161, 177, 0.07);
  border-radius: 5px;
  color: #01A1B1;
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  padding: 1.5rem;

  svg {
    height: 1em;
    margin-right: 2rem;
  }
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListItem = styled.div`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.separation};
  display: flex;
  justify-content: space-between;

  > * {
    margin: 2rem 1rem;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  > .expand {
    flex: 1;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 2rem;
  height: 2rem;
`;

// Typings
interface Props {
  groupId: string;
}

interface State {
  users: IUserData[];
  locale: string;
  tenantLocales: string[];
  loading: boolean;
}

class GroupsListTable extends React.Component<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();

    this.state = {
      users: [],
      locale: '',
      tenantLocales: [],
      loading: false,
    };

    this.subscriptions = [];
  }

    componentDidMount() {
    this.subscriptions.push(this.updateLocales(), this.updateMembers());
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  updateLocales = () => {
    return Rx.Observable.combineLatest(
      localeStream().observable,
      currentTenantStream().observable
    )
    .subscribe(([locale, currentTenant]) => {
      this.setState({
        locale,
        tenantLocales: currentTenant.data.attributes.settings.core.locales,
      });
    });
  }

  updateMembers = () => {
    const NO_MEMBERS = 'No Members';

    this.setState({
      loading: true,
    });

    return listMembership(this.props.groupId).observable.first()
    .switchMap((response) => {
      if (response.data.length === 0) {
        throw NO_MEMBERS;
      }
      return response.data.map((membership) => membership.relationships.user.data.id);
    })
    .switchMap((userId) => {
      return userByIdStream(userId).observable;
    })
    .subscribe((user) => {
      const { users } = this.state;
      users.push(user.data);
      this.setState({ users, loading: false });
    }, (error) => {
      if (error === NO_MEMBERS) {
        this.setState({ users: [], loading: false });
      }
    });
  }

  render() {
    const { users, locale, tenantLocales, loading } = this.state;

    if (loading) {
      return (
        <p>
          <FormattedMessage {...messages.loadingMessage} />
        </p>
      );
    }

    if (users.length === 0) {
      return (
        <EmptyStateMessage>
          <Icon name="warning" />
          <FormattedMessage {...messages.emptyListMessage} />
        </EmptyStateMessage>
      );
    }


    return (
      <ListWrapper>
        {users.map((user) => (
          <ListItem key={user.id}>
            <StyledAvatar userId={user.id} size="small" />
            <div className="expand">
              {`${user.attributes.first_name} ${user.attributes.last_name}`}
            </div>
            <div className="expand">
              {user.attributes.email}
            </div>
          </ListItem>
        ))}
      </ListWrapper>
    );
  }
}

export default injectIntl<Props>(GroupsListTable);
