// Libraries
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';
import { includes } from 'lodash';
import PlatformLocales from 'platformLocales';

// Resources
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import { isNilOrError } from 'utils/helperUtils';
import { updateLocale } from 'services/locale';

// Typings
import { Locale } from 'typings';
export interface InputProps {}
export interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}
export interface State {}

export class LocaleWrapper extends React.PureComponent<InputProps & DataProps & WithRouterProps, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.updateLocale();
  }

  componentDidUpdate() {
    this.updateLocale();
  }

  updateLocale = () => {
    const { tenantLocales, params: { locale }, router: { replace }, location } = this.props;
    const urlLocale = locale as Locale;

    // Don't go any further if the tenant locales are not loaded
    if (isNilOrError(tenantLocales)) return;

    // Update locale in the app if it belongs to the TenantLocales
    const localesSet = new Set(tenantLocales);
    if (localesSet.has(urlLocale)) {
      updateLocale(urlLocale);
    }

    // Try to add a locale if the param is not a supported locale
    if (!includes(Object.keys(PlatformLocales), urlLocale)) {
      replace(`/${tenantLocales[0]}${location.pathname}${location.search}`);
    }
  }

  render() {
    return (
      <>{this.props.children}</>
    );
  }
}

const WithHoC = withRouter(LocaleWrapper);

const Data = adopt<DataProps, {}>({
  tenantLocales: <GetTenantLocales />,
});

export default (inputProps: InputProps) => <Data>{dataProps => <WithHoC {...inputProps} {...dataProps} />}</Data>;
