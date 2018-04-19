import React from 'react';
import { Subscription, Observable } from 'rxjs';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { currentTenantStream } from 'services/tenant';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';

type State = {
  orgType: string | null;
  orgName: string | null;
  loaded: boolean;
};

type Props = OriginalFormattedMessage.Props;

export default class FormattedMessage extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      orgType: null,
      orgName: null,
      loaded: false
    };
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Observable.combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, tenant]) => {
        const tenantLocales = tenant.data.attributes.settings.core.locales;
        const orgName = getLocalized(tenant.data.attributes.settings.core.organization_name, locale, tenantLocales);
        const orgType = tenant.data.attributes.settings.core.organization_type;
        this.setState({ orgName, orgType, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    if (this.state.loaded) {
      const { orgType, orgName } = this.state;
      const values = this.props.values || {};

      if (orgType) {
        values.orgType = orgType;
      }

      if (orgName) {
        values.orgName = orgName;
      }

      return (
        <OriginalFormattedMessage {...this.props} values={values} />
      );
    }

    return null;
  }
}
