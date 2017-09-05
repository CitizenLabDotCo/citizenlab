import * as React from 'react';
import * as _ from 'lodash';

import { connect } from 'react-redux';
import { makeSelectCurrentTenant, makeSelectSetting } from 'utils/tenant/selectors';
import { createStructuredSelector } from 'reselect';
import Helmet from 'react-helmet';

// services
import { ITenantData } from 'services/tenant';

import messages from './messages';

type Props = {
  tenant: ITenantData;
  tFunc: (arg: { [key: string]: string }) => string;
  intl: ReactIntl.InjectedIntl;
};

type State = {};

class MetaHeaders extends React.PureComponent<Props, State> {
  render() {
    const { intl, tenant, tFunc } = this.props;
    const { formatMessage } = intl;
    const titleMultiloc = tenant.attributes.settings.core.meta_title;
    const descriptionMultiloc = tenant.attributes.settings.core.meta_description;
    const organizationNameMultiloc = tenant.attributes.settings.core.organization_name;
    const image = tenant.attributes.logo.large || '';
    const organizationName = (organizationNameMultiloc && !_.isEmpty(organizationNameMultiloc) ? tFunc(organizationNameMultiloc) : '');
    const title = ((titleMultiloc && !_.isEmpty(titleMultiloc)) ? tFunc(titleMultiloc) : formatMessage(messages.helmetTitle, { organizationName }));
    const description = ((descriptionMultiloc && !_.isEmpty(descriptionMultiloc)) ? tFunc(descriptionMultiloc) : formatMessage(messages.helmetDescription, { organizationName }));
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
  }
}

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenant(),
});

export default connect(mapStateToProps)(MetaHeaders) as typeof MetaHeaders;
