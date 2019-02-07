import React from 'react';
import { adopt } from 'react-adopt';
import { IntlProvider } from 'react-intl';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { isNilOrError } from 'utils/helperUtils';
// import translationMessages from 'i18n-test/en';

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends DataProps, InputProps {}

interface State {
  messages: { [key: string]: any };
}

class LanguageProvider extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      messages: {
      }
    };
  }

  componentDidMount() {
    const { locale, tenantLocales } = this.props;

    if (!isNilOrError(locale) && !this.state.messages[locale]) {
      import(`i18n-test/${locale}`).then(translationMessages => {
        this.setState(prevState => ({
          messages: {
            ...prevState.messages,
            [locale]: translationMessages.default
          }
        }));
      });
    }

    if (!isNilOrError(tenantLocales)) {
      for (const locale of tenantLocales) {
        if (!this.state.messages[locale]) {
          import(`i18n-test/${locale}`).then(translationMessages => {
            this.setState(prevState => ({
              messages: {
                ...prevState.messages,
                [locale]: translationMessages.default
              }
            }));
          });
        }
      }
    }
  }

  componentDidUpdate() {
    const { locale, tenantLocales } = this.props;

    if (!isNilOrError(locale) && !this.state.messages[locale]) {
      import(`i18n-test/${locale}`).then(translationMessages => {
        this.setState(prevState => ({
          messages: {
            ...prevState.messages,
            [locale]: translationMessages.default
          }
        }));
      });
    }

    if (!isNilOrError(tenantLocales)) {
      for (const locale of tenantLocales) {
        if (!this.state.messages[locale]) {
          import(`i18n-test/${locale}`).then(translationMessages => {
            this.setState(prevState => ({
              messages: {
                ...prevState.messages,
                [locale]: translationMessages.default
              }
            }));
          });
        }
      }
    }
  }

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
  tenantLocales: <GetTenantLocales />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <LanguageProvider {...inputProps} {...dataProps} />}
  </Data>
);
