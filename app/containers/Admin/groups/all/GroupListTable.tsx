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
import Spinner from 'components/UI/Spinner';
import { List, Row } from 'components/admin/ResourceList';

// Style
import styled from 'styled-components';
import { rgba } from 'polished';
import { color } from 'utils/styleUtils';
import { Locale } from 'typings';

const Loading = styled.div`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

const GroupName = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20ppx;
`;

const GroupCount = styled.div`
  font-size: 16px;
  font-weight: 400;
  margin-left: 50px;
`;

// Typings
interface Props {}

interface State {
  groups: IGroupData[];
  locale: Locale;
  tenantLocales: Locale[];
  loading: boolean;
}

class GroupsListTable extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: 'en',
      tenantLocales: [],
      groups: [],
      loading: true,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const groups$ = listGroups().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        groups$
      ).subscribe(([locale, currentTenant, groups]) => {
        this.setState({
          locale,
          tenantLocales: currentTenant.data.attributes.settings.core.locales,
          groups: groups.data,
          loading: false
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
        <Loading>
          <Spinner size="30px" color="#666" />
        </Loading>
      );
    }

    if (!loading && groups.length === 0) {
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
            <GroupName className="expand">
              {getLocalized(group.attributes.title_multiloc, locale, tenantLocales)}
            </GroupName>
            <GroupCount className="expand">
              <FormattedMessage {...messages.members} values={{ count: group.attributes.memberships_count }} />
            </GroupCount>
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
