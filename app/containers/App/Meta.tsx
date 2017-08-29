import * as React from 'react';
import { connect } from 'react-redux';
import { makeSelectCurrentTenant, makeSelectSetting } from 'utils/tenant/selectors';
import { createStructuredSelector } from 'reselect';
import { injectTFunc } from 'utils/containers/t/utils';
import { injectIntl } from 'react-intl';
import Helmet from 'react-helmet';

import messages from './messages';

type Props = {
  tenant: any,
  metaTitle: Object,
  metaDescription: Object,
  tFunc: Function,
  intl: { formatMessage: Function },
};

const Meta: React.SFC<Props> = ({ tenant, tFunc, intl }) => {
  const { formatMessage } = intl;
  const titleMultiloc = tenant.attributes.settings.core.meta_title;
  const descriptionMultiloc = tenant.attributes.settings.core.meta_description;
  const organizationNameMultiloc = tenant.attributes.settings.core.organization_name;
  const image = tenant.attributes.logo.large;

  const organizationName =
    (organizationNameMultiloc  && tFunc(organizationNameMultiloc));

  const title =
    (titleMultiloc && titleMultiloc.isEmpty && !titleMultiloc.isEmpty() && tFunc(titleMultiloc)) ||
    formatMessage(messages.helmetTitle, { tenantName: organizationName });

  const description =
    (descriptionMultiloc && descriptionMultiloc.isEmpty && !descriptionMultiloc.isEmpty() && tFunc(descriptionMultiloc)) ||
    formatMessage(messages.helmetDescription, { tenantName: organizationName });

  const url = `http://${tenant.attributes.host}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />

      <meta property="og:site_name" content={organizationName} />
    </Helmet>
  );
};

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenant(),
});

export default injectIntl(injectTFunc(connect(mapStateToProps)(Meta)));
