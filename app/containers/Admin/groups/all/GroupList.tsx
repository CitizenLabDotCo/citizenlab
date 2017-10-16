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

  render() {
    const { groups, locale, tenantLocales, loading } = this.state;

    if (loading) {
      return (
        <p>Loading</p>
      );
    }

    if (groups.length === 0 && !loading) {
      return (
        <p>Empty space</p>
      );
    }


    return (
      <table className="e2e-groups-list">
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td></td>
              <td>{getLocalized(group.attributes.title_multiloc, locale, tenantLocales)}</td>
              <td><FormattedMessage {...messages.members} values={{ count: group.attributes.memberships_count }} /></td>
              <td><Button /></td>
              <td><Button /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default GroupsList;
