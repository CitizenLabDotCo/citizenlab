import React, { useEffect, useState } from 'react';
import { Subscription, combineLatest } from 'rxjs';
// eslint-disable-next-line no-restricted-imports
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

type Props = OriginalFormattedMessage.Props;

const RtlBox = styled.span`
  ${isRtl`
      direction: rtl;
  `}
`;

const FormattedMessage = ({ values, ...props }: Props) => {
  const [tenantName, setTenantName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    // ComponentDidMount
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;

    setSubscriptions([
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
          setTenantName(tenantName);
          setOrgName(orgName);
          setOrgType(orgType);
          setLoaded(true);
        }
      }),
    ]);

    console.log('Variables: ', tenantName, orgName, loaded, orgType);
    console.log('Subscriptions: ', subscriptions);

    return () => {
      // ComponentWillUnmount
      // subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  if (loaded && values !== undefined) {
    if (tenantName) {
      values.tenantName = tenantName;
    }

    if (orgType) {
      values.orgType = orgType;
    }

    if (orgName) {
      values.orgName = orgName;
    }

    console.log('Props: ', props);
    console.log('Values: ', values);
    return (
      <RtlBox>
        <OriginalFormattedMessage {...props} values={values} />
      </RtlBox>
    );
  }

  return null;
};

export default FormattedMessage;
