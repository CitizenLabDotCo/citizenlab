// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { listGroups, IGroupData } from 'services/groups';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { FormattedMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';

// Style
import styled from 'styled-components';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ListItem = styled.div`
  align-items: center;
  border-top: 1px solid #EAEAEA;
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

  &:last-child {
    border-bottom: 1px solid #EAEAEA;
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

class GroupsList extends React.Component<Props, State> {
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

  getAvatars = (group: IGroupData) => {

    return (
      <img role="presentation" alt="" />
    );
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

  componentDidMount() {
    this.subscriptions.push(this.updateLocales(), this.updateGroups());
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
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
        <p>
          <FormattedMessage {...messages.emptyListMessage} />
        </p>
      );
    }


    return (
      <ListWrapper className="e2e-groups-list">
          {groups.map((group) => (
            <ListItem key={group.id}>
              <span>{this.getAvatars(group)}</span>
              <p className="expand">
                {getLocalized(group.attributes.title_multiloc, locale, tenantLocales)}
              </p>
              <p className="expand">
                <FormattedMessage {...messages.members} values={{ count: group.attributes.memberships_count }} />
              </p>
              <Button style="text" icon="delete">
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
              <Button linkTo={`/admin/groups/${group.id}`} style="secondary" icon="edit">
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>
            </ListItem>
          ))}
    </ListWrapper>
    );
  }
}

export default GroupsList;
