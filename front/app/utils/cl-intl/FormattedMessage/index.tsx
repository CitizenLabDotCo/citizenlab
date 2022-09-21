import React, { useEffect, useState } from 'react';
import { combineLatest } from 'rxjs';
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
  const [localValues] = useState(values || {});

  useEffect(() => {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;

    const subscriptions = [
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
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  if (loaded) {
    if (tenantName) {
      localValues.tenantName = tenantName;
    }

    if (orgType) {
      localValues.orgType = orgType;
    }

    if (orgName) {
      localValues.orgName = orgName;
    }

    return (
      <RtlBox>
        <OriginalFormattedMessage {...props} values={localValues} />
      </RtlBox>
    );
  }

  return null;
};

export default FormattedMessage;
