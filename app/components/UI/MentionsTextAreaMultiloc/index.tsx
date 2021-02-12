import React from 'react';

// components
import MentionsTextArea from 'components/UI/MentionsTextArea';
import { Label } from 'cl2-component-library';

// resources
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const MentionsTextAreaWrapper = styled.div`
  &:not(.last) {
    margin-bottom: 12px;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

const LanguageExtension = styled.span`
  font-weight: 500;
`;

export interface InputProps {
  name: string;
  rows: number;
  valueMultiloc: Multiloc | null | undefined;
  id?: string;
  label?: string | JSX.Element | null;
  onChange?: (arg: Multiloc, locale: Locale) => void;
  placeholder?: string;
  errorMultiloc?: Multiloc | null;
  selectedLocale?: Locale;
  postId?: string;
  postType?: 'idea' | 'initiative';
  padding?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  fontSize?: number;
  backgroundColor?: string;
  ariaLabel?: string;
  className?: string;
}

interface DataProps {
  tenantLocales: GetAppConfigurationLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class MentionsTextAreaMultiloc extends React.PureComponent<Props, State> {
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

  render() {
    const {
      onBlur,
      onFocus,
      padding,
      postId,
      postType,
      rows,
      label,
      placeholder,
      valueMultiloc,
      errorMultiloc,
      fontSize,
      backgroundColor,
      ariaLabel,
      className,
      tenantLocales,
      name,
    } = this.props;

    if (!isNilOrError(tenantLocales)) {
      return (
        <Container
          id={this.props.id}
          className={`${className || ''} e2e-multiloc-input`}
        >
          {tenantLocales.map((tenantLocale, index) => {
            const value = valueMultiloc?.[tenantLocale] || null;
            const error = errorMultiloc?.[tenantLocale] || null;
            const id = this.props.id && `${this.props.id}-${tenantLocale}`;

            return (
              <MentionsTextAreaWrapper
                key={tenantLocale}
                className={`${index === tenantLocales.length - 1 && 'last'}`}
              >
                {label && (
                  <LabelWrapper>
                    <Label htmlFor={id}>{label}</Label>
                    {tenantLocales.length > 1 && (
                      <LanguageExtension>
                        {tenantLocale.toUpperCase()}
                      </LanguageExtension>
                    )}
                  </LabelWrapper>
                )}

                <MentionsTextArea
                  id={id}
                  name={name}
                  value={value}
                  placeholder={placeholder}
                  rows={rows}
                  postId={postId}
                  postType={postType}
                  padding={padding}
                  error={error}
                  onChange={this.handleOnChange(tenantLocale)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  ariaLabel={ariaLabel}
                  fontSize={fontSize ? `${fontSize}px` : undefined}
                  background={backgroundColor}
                />
              </MentionsTextAreaWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

export default (InputProps: InputProps) => (
  <GetAppConfigurationLocales>
    {(tenantLocales) => (
      <MentionsTextAreaMultiloc {...InputProps} tenantLocales={tenantLocales} />
    )}
  </GetAppConfigurationLocales>
);
