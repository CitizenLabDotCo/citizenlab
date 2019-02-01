import React, { PureComponent } from 'react';
import { Locale, Multiloc, MultilocFormValues } from 'typings';
import { adopt } from 'react-adopt';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  onLocaleChange: (loc: Locale) => () => void;
  values: MultilocFormValues;
  selectedLocale: Locale;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

class FormLocaleSwitcher extends PureComponent<Props> {

  validatePerLocale = (locale: Locale) => {
    const { values } = this.props;
    return Object.getOwnPropertyNames(values).every(field =>
      !!values[field][locale] && values[field][locale] !== '');
  }

  render() {
    const { tenantLocales, onLocaleChange, selectedLocale } = this.props;

    if (!isNilOrError(tenantLocales)) {
      return tenantLocales.map(locale => (
        <button key={locale} onClick={onLocaleChange(locale)} type="button">
          {locale === selectedLocale && 'Here'}
          {this.validatePerLocale(locale) && 'yay'}
          {locale}
        </button>
      ));
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <FormLocaleSwitcher {...inputProps} {...dataprops} />}
  </Data>
);
