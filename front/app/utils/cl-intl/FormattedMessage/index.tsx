import React from 'react';
import { Subscription, combineLatest } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

type State = {
  tenantName: string | null;
  orgType: string | null;
  orgName: string | null;
  loaded: boolean;
};

type Props = {
  'data-cy'?: string;
} & React.ComponentProps<typeof OriginalFormattedMessage>;

const RtlBox = styled.span`
  ${isRtl`
      direction: rtl;
  `}
`;

export default class FormattedMessageComponent extends React.PureComponent<
  Props,
  State
> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      tenantName: null,
      orgType: null,
      orgName: null,
      loaded: false,
    };
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest([locale$, currentTenant$]).subscribe(([locale, tenant]) => {
        if (!isNilOrError(locale) && !isNilOrError(tenant)) {
          const tenantLocales = tenant.data.attributes.settings.core.locales;
          const tenantName = tenant.data.attributes.name;
          const orgName = getLocalized(
            tenant.data.attributes.settings.core.organization_name,
            locale,
            tenantLocales
          );
          const orgType =
            tenant.data.attributes.settings.core.organization_type;
          this.setState({ tenantName, orgName, orgType, loaded: true });
        }
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    if (this.state.loaded) {
      const { tenantName, orgType, orgName } = this.state;
      const values = this.props.values || {};

      if (tenantName) {
        values.tenantName = tenantName;
      }

      if (orgType) {
        values.orgType = orgType;
      }

      if (orgName) {
        values.orgName = orgName;
      }

      return (
        <RtlBox data-cy={this.props['data-cy']}>
          <OriginalFormattedMessage {...this.props} values={values} />
        </RtlBox>
      );
    }

    return null;
  }
}
