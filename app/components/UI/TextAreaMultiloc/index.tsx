import React from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { get } from 'lodash-es';

// components
import TextArea from 'components/UI/TextArea';
import { Label, IconTooltip } from 'cl2-component-library';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, IAppConfiguration } from 'services/tenant';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const TextAreaContainer = styled.div`
  &:not(.last) {
    margin-bottom: 12px;
  }
`;

const LanguageExtension = styled.span`
  font-weight: 500;
`;

export type Props = {
  id?: string | undefined;
  name: string;
  valueMultiloc?: Multiloc | null;
  label?: string | JSX.Element | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  onChange?: (arg: Multiloc, locale: Locale) => void;
  placeholder?: string | null | undefined;
  rows?: number | undefined;
  errorMultiloc?: Multiloc | null;
  maxCharCount?: number | undefined;
  renderPerLocale?: (locale: string) => JSX.Element;
  disabled?: boolean;
  selectedLocale?: Locale;
};

type State = {
  locale: Locale | null;
  currentTenant: IAppConfiguration | null;
};

export default class TextAreaMultiloc extends React.PureComponent<
  Props,
  State
> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      combineLatest(locale$, currentTenant$).subscribe(
        ([locale, currentTenant]) => {
          this.setState({ locale, currentTenant });
        }
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleOnChange = (locale: Locale) => (value: string) => {
    if (this.props.onChange) {
      this.props.onChange(
        {
          ...this.props.valueMultiloc,
          [locale]: value,
        },
        locale
      );
    }
  };

  renderOnce = (currentTenantLocale, index, totalLocales) => {
    const {
      label,
      labelTooltipText,
      name,
      placeholder,
      rows,
      maxCharCount,
      valueMultiloc,
      errorMultiloc,
      renderPerLocale,
      disabled,
    } = this.props;
    const value = get(valueMultiloc, [currentTenantLocale], '') as string;
    const error = get(errorMultiloc, [currentTenantLocale], null);
    const id = this.props.id && `${this.props.id}-${currentTenantLocale}`;

    return (
      <TextAreaContainer
        key={currentTenantLocale}
        className={`${index === totalLocales - 1 && 'last'}`}
      >
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {totalLocales > 1 && (
              <LanguageExtension>
                {currentTenantLocale.toUpperCase()}
              </LanguageExtension>
            )}
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
          </Label>
        )}

        {renderPerLocale && renderPerLocale(currentTenantLocale)}

        <TextArea
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          rows={rows}
          error={error}
          onChange={this.handleOnChange(currentTenantLocale)}
          maxCharCount={maxCharCount}
          disabled={disabled}
        />
      </TextAreaContainer>
    );
  };

  render() {
    const { locale, currentTenant } = this.state;
    const { selectedLocale } = this.props;

    if (locale && currentTenant) {
      const currentTenantLocales =
        currentTenant.data.attributes.settings.core.locales;
      const totalLocales = currentTenantLocales.length;

      return (
        <Container id={this.props.id} className={this.props['className']}>
          {selectedLocale
            ? this.renderOnce(selectedLocale, 1, totalLocales)
            : currentTenantLocales.map((currentTenantLocale, index) => {
                return this.renderOnce(
                  currentTenantLocale,
                  index,
                  totalLocales
                );
              })}
        </Container>
      );
    }

    return null;
  }
}
