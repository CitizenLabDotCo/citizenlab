import * as React from 'react';
import * as Rx from 'rxjs';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { currentTenantStream } from 'services/tenant';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';

type State = {
  orgType: string | null,
  orgName: string | null,
};

type Props = OriginalFormattedMessage.Props;

export default class FormattedMessage extends React.PureComponent<Props, State> {

  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      orgType: null,
      orgName: null,
    };
  }

  componentWillMount() {

    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, tenant]) => {
        const tenantLocales = tenant.data.attributes.settings.core.locales;
        const orgName = getLocalized(tenant.data.attributes.settings.core.organization_name, locale, tenantLocales);
        this.setState({
          orgName,
          orgType: tenant.data.attributes.settings.core.organization_type,
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { orgType, orgName } = this.state;
    const values = this.props.values || {};
    if (orgType)
      values.orgType = orgType;

    if (orgName)
      values.orgName = orgName;

    return (
      <OriginalFormattedMessage
        {...this.props}
        values={values}
      />
    );
  }
}
