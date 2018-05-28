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

const ProjectsMeta: React.SFC<Props & InjectedIntlProps> = ({ locale, currentTenant, intl }) => {
  if (!isNilOrError(locale) && !isNilOrError(currentTenant)) {
    const { formatMessage } = intl;
    const projectsIndexUrl = window.location.href;

    const currentTenantLocales = currentTenant.attributes.settings.core.locales;
    const organizationNameMultiLoc = currentTenant.attributes.settings.core.organization_name;
    const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);

    const projectsIndexTitle = formatMessage(messages.helmetTitle, { tenantName: currentTenantName });
    const projectsIndexDescription = formatMessage(messages.helmetDescription,{ tenantName: currentTenantName });

    return (
      <Helmet>
        <title>{projectsIndexTitle}</title>
        <meta name="title" content={projectsIndexTitle}/>
        <meta name="description" content={projectsIndexDescription} />
        <meta property="og:title" content={projectsIndexTitle} />
        <meta property="og:description" content={projectsIndexDescription} />
        <meta property="og:url" content={projectsIndexUrl} />
      </Helmet>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  currentTenant: <GetTenant />,
});

const ProjectsMetaWithHoc = injectIntl<Props>(ProjectsMeta);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectsMetaWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
