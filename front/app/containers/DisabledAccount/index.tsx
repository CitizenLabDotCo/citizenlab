import React from 'react';
import moment from 'moment';
import { adopt } from 'react-adopt';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Title } from 'components/smallForm';
import { useSearchParams } from 'react-router-dom';
import Link from 'utils/cl-router/Link';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  tenantLocales: GetAppConfigurationLocalesChildProps;
  tenant: GetAppConfigurationChildProps;
  locale: GetLocaleChildProps;
}

const DisabledAccount = ({ tenant, locale, tenantLocales }: DataProps) => {
  const [searchParams] = useSearchParams();

  if (isNilOrError(locale) || isNilOrError(tenant)) return null;

  const parsedDate = moment(searchParams.get('date')).format('LL');
  const organizationNameMultiLoc =
    tenant.attributes.settings.core.organization_name;
  const organizationName = getLocalized(
    organizationNameMultiLoc,
    locale,
    tenantLocales
  );

  const TermsAndConditions = (
    <Link to="/pages/terms-and-conditions">
      <FormattedMessage {...messages.termsAndConditions} />
    </Link>
  );
  return (
    <Box
      display="flex"
      maxWidth="380px"
      px="20px"
      width="100%"
      marginLeft="auto"
      marginRight="auto"
      flexDirection="column"
      mt="60px"
    >
      <Title style={{ paddingTop: '26px' }}>
        <FormattedMessage {...messages.title} />
      </Title>
      <FormattedMessage
        {...messages.text}
        values={{
          organizationName,
          TermsAndConditions,
        }}
      />
      <br />
      <FormattedMessage
        {...messages.bottomText}
        values={{ date: parsedDate }}
      />
    </Box>
  );
};

const Data = adopt<DataProps>({
  tenantLocales: <GetAppConfigurationLocales />,
  tenant: <GetAppConfiguration />,
  locale: <GetLocale />,
});

const WrappedDisabledAccount = () => (
  <Data>{(dataprops) => <DisabledAccount {...dataprops} />}</Data>
);

export default WrappedDisabledAccount;
