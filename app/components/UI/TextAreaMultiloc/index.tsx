import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import TextArea from 'components/UI/TextArea';
import Label from 'components/UI/Label';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const TextAreaWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 12px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

const LanguageExtension = styled(Label)`
  font-weight: 500;
  margin-left: 5px;
`;

type Props = {
  name: string;
  valueMultiloc: Multiloc | null | undefined;
  label?: string | JSX.Element | null | undefined;
  onChange?: (arg: Multiloc, locale: Locale) => void;
  placeholderMultiloc?: Multiloc | null;
  rows?: number | undefined;
  errorMultiloc?: Multiloc | null;
  maxCharCount?: number | undefined;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
};

export default class TextAreaMultiloc extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, currentTenant]) => {
        this.setState({ locale, currentTenant });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnChange = (locale: Locale) => (value: string) => {
    if (this.props.onChange) {
      this.props.onChange({
        ...this.props.valueMultiloc,
        [locale]: value
      }, locale);
    }
  }

  render() {
    const { label } = this.props;
    const { locale, currentTenant } = this.state;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      return (
        <Container className={this.props['className']} >
          {currentTenantLocales.map((currentTenantLocale, index) => {
            const value = (this.props.valueMultiloc && this.props.valueMultiloc[currentTenantLocale] && this.props.valueMultiloc[currentTenantLocale] && isString(this.props.valueMultiloc[currentTenantLocale]) ? this.props.valueMultiloc[currentTenantLocale] as string : '');
            const placeholder = (this.props.placeholderMultiloc && this.props.placeholderMultiloc[currentTenantLocale] ? this.props.placeholderMultiloc[currentTenantLocale] : null);
            const error = (this.props.errorMultiloc && this.props.errorMultiloc[currentTenantLocale] ? this.props.errorMultiloc[currentTenantLocale] : null);

            return (
              <TextAreaWrapper key={currentTenantLocale} className={`${index === currentTenantLocales.length - 1 && 'last'}`}>
                {label &&
                  <LabelWrapper>
                    <Label>{label}</Label>
                    {currentTenantLocales.length > 1 &&
                      <LanguageExtension>{currentTenantLocale.toUpperCase()}</LanguageExtension>
                    }
                  </LabelWrapper>
                }

                <TextArea
                  name={this.props.name}
                  value={value}
                  placeholder={placeholder}
                  rows={this.props.rows}
                  error={error}
                  onChange={this.handleOnChange(currentTenantLocale)}
                  maxCharCount={this.props.maxCharCount}
                />
              </TextAreaWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}
