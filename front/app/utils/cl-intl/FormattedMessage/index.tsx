import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { getLocalized } from 'utils/i18n';
import { isRtl } from 'utils/styleUtils';
import styled from 'styled-components';

type Props = {
  'data-cy'?: string;
} & React.ComponentProps<typeof OriginalFormattedMessage>;

const RtlBox = styled.span`
  ${isRtl`
      direction: rtl;
  `}
`;

const FormattedMessageComponent = (props: Props) => {
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  if (isNilOrError(appConfig) || isNilOrError(locale)) {
    return null;
  }

  const locales = appConfig.attributes.settings.core.locales;
  const tenantName = appConfig.attributes.name;
  const orgName = getLocalized(
    appConfig.attributes.settings.core.organization_name,
    locale,
    locales
  );

  const orgType = appConfig.attributes.settings.core.organization_type;

  const values = {
    ...props.values,
    ...(tenantName && { tenantName }),
    ...(orgType && { orgType }),
    ...(orgName && { orgName }),
  };
  return (
    <RtlBox data-cy={props['data-cy']}>
      <OriginalFormattedMessage {...props} values={values} />
    </RtlBox>
  );
};

export default FormattedMessageComponent;
