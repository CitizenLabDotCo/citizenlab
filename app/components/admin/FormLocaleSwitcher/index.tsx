import React, { PureComponent } from 'react';
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
  display: flex;
  width: 100%;
  justify-content: flex-end;
  & > :not(:last-child) {
    margin-right: 5px;
  }
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  padding: 7px 9px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
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
    background: ${colors.emailBg};
  }
  &:hover, &:focus, &.isSelected:hover, &.isSelected:focus {
    background: ${(darken(0.1, colors.emailBg))};
    outline: none;
  }
`;

interface InputProps {
  onLocaleChange: (loc: Locale) => void;
  values: MultilocFormValues;
  selectedLocale: Locale;
  className?: string;
}

interface DataProps {
  tenantLocales: GetTenantLocalesChildProps;
}

interface Props extends InputProps, DataProps { }

class FormLocaleSwitcher extends PureComponent<Props> {

  validatePerLocale = (locale: Locale) => {
    const { values } = this.props;
    return Object.getOwnPropertyNames(values).every(field => !isEmpty(get(values, `[${field}][${locale}]`)));
  }

  handleOnClick = (locale: Locale) => (event: React.MouseEvent<any>) => {
    event.preventDefault();
    this.props.onLocaleChange(locale);
  }

  render() {
    const { tenantLocales, selectedLocale, className } = this.props;

    console.log(this.props.values);

    if (!isNilOrError(tenantLocales) && tenantLocales.length > 1) {
      return (
        <Container className={className}>
          {tenantLocales.map((locale: Locale) => (
            <StyledButton
              key={locale}
              onClick={this.handleOnClick(locale)}
              type="button"
              className={`${locale} ${locale === selectedLocale && 'isSelected'} ${this.validatePerLocale(locale) && 'isComplete'}`}
            >
              <Icon name="dot" />
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
    {dataprops => <FormLocaleSwitcher {...inputProps} {...dataprops} />}
  </Data>
);
