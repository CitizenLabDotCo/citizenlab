import React, { PureComponent, MouseEvent } from 'react';
import { Locale, MultilocFormValues } from 'typings';
import { adopt } from 'react-adopt';
import { isEmpty, get } from 'lodash-es';
import GetTenantLocales, {
  GetTenantLocalesChildProps,
} from 'resources/GetTenantLocales';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const StyledButton = styled.button`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.small}px;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-weight: 500;
  white-space: nowrap;
  padding: 7px 8px;
  margin-right: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.lightGreyishBlue};
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-right: 0px;
  }

  &:not(.isSelected):hover {
    color: ${colors.adminTextColor};
    background: ${rgba(colors.adminTextColor, 0.2)};
  }

  &.isSelected {
    color: #fff;
    background: ${colors.adminTextColor};
  }
`;

const Dot = styled.div`
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${colors.clRed};
  margin-right: 5px;

  &.isComplete {
    background: ${colors.clGreen};
  }
`;

interface InputProps {
  onLocaleChange: (loc: Locale) => void;
  locales?: Locale[];
  values?: MultilocFormValues;
  selectedLocale: Locale;
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps {}

class FormLocaleSwitcher extends PureComponent<Props> {
  validatePerLocale = (locale: Locale) => {
    const { values } = this.props;
    return Object.getOwnPropertyNames(values).every(
      (key) => !isEmpty(get(values, `[${key}][${locale}]`))
    );
  };

  removeFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  handleOnClick = (locale: Locale) => (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    this.props.onLocaleChange(locale);
  };

  render() {
    const { tenantLocales, selectedLocale, values, className } = this.props;
    const locales = this.props.locales || tenantLocales;

    if (!isNilOrError(locales) && locales.length > 1) {
      return (
        <Container className={className}>
          {locales.map((locale, index) => (
            <StyledButton
              key={locale}
              onMouseDown={this.removeFocus}
              onClick={this.handleOnClick(locale)}
              type="button"
              className={`e2e-locale-switch ${locale} ${
                locale === selectedLocale ? 'isSelected' : ''
              } ${index + 1 === locales.length ? 'last' : ''}`}
            >
              {values && (
                <Dot
                  className={
                    this.validatePerLocale(locale)
                      ? 'isComplete'
                      : 'notComplete'
                  }
                />
              )}
              {locale}
            </StyledButton>
          ))}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenantLocales: <GetTenantLocales />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <FormLocaleSwitcher {...inputProps} {...dataprops} />}
  </Data>
);
