import * as React from 'react';
import * as _ from 'lodash';
import Helmet from 'react-helmet';
import * as _ from 'lodash';

// services
import { ITenant } from 'services/tenant';
import { localeStream } from 'services/locale';

// i18n
import messages from './messages';
import i18n from 'utils/i18n';
import { injectIntl, InjectedIntlProps } from 'react-intl';

type Props = {
  tenant: ITenant;
};

class Meta extends React.PureComponent<Props & InjectedIntlProps, {}> {
  render() {
    const { tenant, intl } = this.props;
    const { formatMessage } = intl;
    const image = tenant.data.attributes.logo.large || '';
    const title = i18n.getLocalized(tenant.data.attributes.settings.core.meta_title);
    const organizationName = i18n.getLocalized(tenant.data.attributes.settings.core.organization_name);
    const description = i18n.getLocalized(tenant.data.attributes.settings.core.meta_description);
    const url = `http://${tenant.data.attributes.host}`;

    return (
      <Helmet>
        <title>{formatMessage(messages.helmetTitle, { organizationName })}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={formatMessage(messages.helmetDescription, { organizationName })} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:site_name" content={organizationName} />
      </Helmet>
    );
  }
}

export default injectIntl(Meta);
