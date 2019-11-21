import React, { PureComponent, MouseEvent } from 'react';
import { Locale, MultilocFormValues } from 'typings';
import { adopt } from 'react-adopt';
import { isEmpty, get } from 'lodash-es';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { darken } from 'polished';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChildContent = styled.div`
  margin-right: 15px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const LocaleButtons = styled.div`
  display: flex;
  align-items: center;
`;

const LocaleButton = styled.button`
  color: ${colors.label};
  display: flex;
  align-items: center;
  text-transform: uppercase;
  white-space: nowrap;
  padding: 7px 9px;
  margin-left: 5px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &.first {
    margin-left: 0px;
  }

  svg {
    fill: ${colors.clRed};
  }

  & >:first-child {
    margin-right: 7px;
  }

  &.isComplete {
    svg {
      fill: ${colors.clGreen};
    }
  }

  &.isSelected {
    color: #000;
    background: ${colors.lightGreyishBlue};
  }

  &:hover {
    color: #000;
    background: ${darken(0.05, colors.lightGreyishBlue)};
  }
`;

interface InputProps {
  onLocaleChange: (loc: Locale) => void;
  values: MultilocFormValues;
  selectedLocale: Locale;
  className?: string;
  children?: any;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

class FormLocaleSwitcher extends PureComponent<Props> {

  validatePerLocale = (locale: Locale) => {
    const { values } = this.props;
    return Object.getOwnPropertyNames(values).every(key => !isEmpty(get(values, `[${key}][${locale}]`)));
  }

  removeFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }

  handleOnClick = (locale: Locale) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onLocaleChange(locale);
  }

  render() {
    const { tenantLocales, selectedLocale, className, children } = this.props;

    if (!isNilOrError(tenantLocales) && tenantLocales.length > 1) {
      return (
        <Container className={className}>
          {children &&
            <ChildContent>
              {children}
            </ChildContent>
          }

          <Spacer aria-hidden />

          <LocaleButtons>
            {tenantLocales.map((locale, index) => (
              <LocaleButton
                key={locale}
                onMouseDown={this.removeFocus}
                onClick={this.handleOnClick(locale)}
                type="button"
                className={`e2e-locale-switch ${locale} ${index === 0 ? 'first' : ''} ${locale === selectedLocale ? 'isSelected' : ''} ${this.validatePerLocale(locale) ? 'isComplete' : 'notComplete'}`}
              >
                <Icon name="dot" ariaHidden />
                {locale}
              </LocaleButton>
            ))}
          </LocaleButtons>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <FormLocaleSwitcher {...inputProps} {...dataprops} />}
  </Data>
);
