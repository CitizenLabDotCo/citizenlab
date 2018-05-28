// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import Helmet from 'react-helmet';
import { isNilOrError } from 'utils/helperUtils';


// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { getLocalized } from 'utils/i18n';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  currentTenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaMeta: React.SFC<Props & InjectedIntlProps> = ({ locale, currentTenant, intl }) => {
  if (!isNilOrError(locale) && !isNilOrError(currentTenant)) {
    const { formatMessage } = intl;
    const ideasIndexUrl = window.location.href;

    const currentTenantLocales = currentTenant.attributes.settings.core.locales;
    const organizationNameMultiLoc = currentTenant.attributes.settings.core.organization_name;
    const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);

    const ideasIndexTitle = formatMessage(messages.helmetTitle, { tenantName: currentTenantName });
    const ideasIndexDescription = formatMessage(messages.helmetDescription,{ tenantName: currentTenantName });

    return (
      <Helmet>
        <title>{ideasIndexTitle}</title>
        <meta name="title" content={ideasIndexTitle}/>
        <meta name="description" content={ideasIndexDescription} />
        <meta property="og:title" content={ideasIndexTitle} />
        <meta property="og:description" content={ideasIndexDescription} />
        <meta property="og:url" content={ideasIndexUrl} />
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  currentTenant: <GetTenant />,
});

const IdeaMetaWithHoc = injectIntl<Props>(IdeaMeta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
