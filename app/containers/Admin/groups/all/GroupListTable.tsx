// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listGroups, deleteGroup, IGroupData } from 'services/groups';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import GroupAvatar from './GroupAvatar';

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
  margin-top: -2rem;
`;

const ListItem = styled.div`
  align-items: center;
  border-bottom: 1px solid #EAEAEA;
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

// Typings
interface Props {

}

interface State {
  groups: IGroupData[];
  locale: string;
  tenantLocales: string[];
  loading: boolean;
}

class GroupsListTable extends React.Component<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();

    this.state = {
      locale: '',
      tenantLocales: [],
      groups: [],
      loading: false,
    };

    this.subscriptions = [];
  }

    componentDidMount() {
    this.subscriptions.push(this.updateLocales(), this.updateGroups());
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

  updateGroups = () => {
    this.setState({
      loading: true,
    });

    return listGroups().observable.subscribe((response) => {
      this.setState({
        groups: response.data,
        loading: false,
      });
    });
  }

  createDeleteGroupHandler = (groupId) => {
    const deletionMessage = this.props.intl.formatMessage(messages.groupDeletionConfirmation);

    return (event) => {
      event.preventDefault();

      if (window.confirm(deletionMessage)) {
        deleteGroup(groupId);
      }
    };
  }

  render() {
    const { groups, locale, tenantLocales, loading } = this.state;

    if (loading) {
      return (
        <p>
          <FormattedMessage {...messages.loadingMessage} />
        </p>
      );
    }

    if (groups.length === 0) {
      return (
        <EmptyStateMessage>
          <Icon name="warning" />
          <FormattedMessage {...messages.emptyListMessage} />
        </EmptyStateMessage>
      );
    }


    return (
      <ListWrapper className="e2e-groups-list">
        {groups.map((group) => (
          <ListItem key={group.id}>
            <GroupAvatar groupId={group.id} />
            <p className="expand">
              {getLocalized(group.attributes.title_multiloc, locale, tenantLocales)}
            </p>
            <p className="expand">
              <FormattedMessage {...messages.members} values={{ count: group.attributes.memberships_count }} />
            </p>
            <Button onClick={this.createDeleteGroupHandler(group.id)} style="text" circularCorners={false} icon="delete">
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
            <Button linkTo={`/admin/groups/edit/${group.id}`} style="secondary" circularCorners={false} icon="edit">
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
          </ListItem>
        ))}
      </ListWrapper>
    );
  }
}

export default injectIntl<Props>(GroupsListTable);
