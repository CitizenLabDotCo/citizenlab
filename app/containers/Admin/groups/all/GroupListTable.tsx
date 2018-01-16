// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listGroups, deleteGroup, IGroupData } from 'services/groups';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import GroupAvatar from './GroupAvatar';
import { List, Row } from 'components/admin/ResourceList';

// Style
import styled from 'styled-components';
import { rgba } from 'polished';
import { color } from 'utils/styleUtils';
import { Locale } from 'typings';

const EmptyStateMessage = styled.p`
  align-items: center;
  background: ${props => rgba(props.theme.colors.clBlue, .07)};
  border-radius: 5px;
  color: ${color('clBlue')};
  display: flex;
  font-size: 1.15rem;
  margin-top: 2rem;
  padding: 1.5rem;

  svg {
    height: 1em;
    margin-right: 2rem;
  }
`;

// Typings
interface Props {

}

interface State {
  groups: IGroupData[];
  locale: Locale;
  tenantLocales: Locale[];
  loading: boolean;
}

class GroupsListTable extends React.Component<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      locale: 'en',
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
      <List>
        {groups.map((group) => (
          <Row key={group.id}>
            <GroupAvatar groupId={group.id} />
            <h2 className="expand">
              {getLocalized(group.attributes.title_multiloc, locale, tenantLocales)}
            </h2>
            <p className="expand">
              <FormattedMessage {...messages.members} values={{ count: group.attributes.memberships_count }} />
            </p>
            <Button onClick={this.createDeleteGroupHandler(group.id)} style="text" circularCorners={false} icon="delete">
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
            <Button linkTo={`/admin/groups/edit/${group.id}`} style="secondary" circularCorners={false} icon="edit">
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
          </Row>
        ))}
      </List>
    );
  }
}

export default injectIntl<Props>(GroupsListTable);
