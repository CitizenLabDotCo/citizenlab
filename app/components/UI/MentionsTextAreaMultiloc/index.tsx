import React from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { get } from 'lodash-es';

// components
import MentionsTextArea from 'components/UI/MentionsTextArea';
// since it will only be seen by admins, making the whoice of using the admin Label component for now.
import Label from 'components/UI/Label';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const MentionsTextAreaWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 12px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

const LanguageExtension = styled(Label)`
  font-weight: 500;
`;

export type Props = {
  name: string;
  rows: number;
  valueMultiloc: Multiloc | null | undefined;
  id?: string | undefined;
  label?: string | JSX.Element | null | undefined;
  onChange?: (arg: Multiloc, locale: Locale) => void;
  placeholder?: string | undefined;
  errorMultiloc?: Multiloc | null;
  shownLocale?: Locale;
  ideaId?: string | undefined
  padding?: string | undefined;
  onBlur?: () => void;
  onFocus?: () => void | undefined;
  fontSize?: number;
  backgroundColor?: string;
  placeholderFontWeight?: string;
  ariaLabel?: string;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
};

export default class MentionsTextAreaMultiloc extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      combineLatest(
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
    const { locale, currentTenant } = this.state;
    const { onBlur,
      onFocus,
      padding,
      ideaId,
      rows,
      shownLocale,
      label,
      placeholder,
      valueMultiloc,
      errorMultiloc,
      fontSize,
      backgroundColor,
      placeholderFontWeight,
      ariaLabel
    } = this.props;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      if (shownLocale) {
        const value = get(valueMultiloc, [shownLocale], null);
        const error = get(errorMultiloc, [shownLocale], null);
        const id = this.props.id && `${this.props.id}-${shownLocale}`;
        return (
          <MentionsTextAreaWrapper>
            {label &&
              <LabelWrapper>
                <Label htmlFor={id}>{label}</Label>
              </LabelWrapper>
            }

            <MentionsTextArea
              id={id}
              name={name}
              value={value}
              placeholder={placeholder}
              rows={rows}
              ideaId={ideaId}
              padding={padding}
              error={error}
              onChange={this.handleOnChange(shownLocale)}
              onBlur={onBlur}
              onFocus={onFocus}
              fontSize={`${fontSize || fontSizes.base}px`}
              background={backgroundColor}
              placeholderFontWeight={placeholderFontWeight}
              ariaLabel={ariaLabel}
            />
          </MentionsTextAreaWrapper>
        );
      } else {
        return (
          <Container id={this.props.id} className={`${this.props['className']} e2e-multiloc-input`} >
            {currentTenantLocales.map((currentTenantLocale, index) => {
              const value = get(valueMultiloc, [currentTenantLocale], null);
              const error = get(errorMultiloc, [currentTenantLocale], null);
              const id = this.props.id && `${this.props.id}-${currentTenantLocale}`;

              return (
                <MentionsTextAreaWrapper key={currentTenantLocale} className={`${index === currentTenantLocales.length - 1 && 'last'}`}>
                  {label &&
                    <LabelWrapper>
                      <Label htmlFor={id}>{label}</Label>
                      {currentTenantLocales.length > 1 &&
                        <LanguageExtension>{currentTenantLocale.toUpperCase()}</LanguageExtension>
                      }
                    </LabelWrapper>
                  }

                  <MentionsTextArea
                    id={id}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    rows={rows}
                    ideaId={ideaId}
                    padding={padding}
                    error={error}
                    onChange={this.handleOnChange(currentTenantLocale)}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    ariaLabel={ariaLabel}
                  />
                </MentionsTextAreaWrapper>
              );
            })}}
        </Container>
        );
      }
    }

    return null;
  }
}
