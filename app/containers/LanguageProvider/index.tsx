import React from 'react';
import { adopt } from 'react-adopt';
import { IntlProvider } from 'react-intl';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { isNilOrError } from 'utils/helperUtils';
import { Locale } from 'typings';

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends DataProps, InputProps {}

interface State {
  messages: { [key: string]: any };
}

class LanguageProvider extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      messages: {},
    };
  }

  componentDidMount() {
    this.loadLocales();
  }

  componentDidUpdate() {
    this.loadLocales();
  }

  loadLocales = () => {
    const { locale, tenantLocales } = this.props;

    if (!isNilOrError(locale) && !this.state.messages[locale]) {
      this.importLocale(locale);
    }

    if (!isNilOrError(tenantLocales)) {
      this.importTenantLocales(tenantLocales);
    }
  };

  importLocale = (locale: Locale) => {
    import(`i18n/${locale}`).then((translationMessages) => {
      this.setState((prevState) => ({
        messages: {
          ...prevState.messages,
          [locale]: translationMessages.default,
        },
      }));
    });
  };

  importTenantLocales = (tenantLocales: Locale[]) => {
    for (const locale of tenantLocales) {
      if (!this.state.messages[locale]) {
        import(`i18n/${locale}`).then((translationMessages) => {
          this.setState((prevState) => ({
            messages: {
              ...prevState.messages,
              [locale]: translationMessages.default,
            },
          }));
        });
      }
    }
  };

  render() {
    const { locale } = this.props;
    const { messages } = this.state;

    if (locale && messages[locale]) {
      return (
        <IntlProvider locale={locale} key={locale} messages={messages[locale]}>
          {React.Children.only(this.props.children)}
        </IntlProvider>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetAppConfigurationLocales />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <LanguageProvider {...inputProps} {...dataProps} />}
  </Data>
);
