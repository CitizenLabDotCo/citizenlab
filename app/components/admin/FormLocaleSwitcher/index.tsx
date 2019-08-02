import React, { PureComponent } from 'react';
import { Locale, MultilocFormValues } from 'typings';
import { adopt } from 'react-adopt';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { darken } from 'polished';

const Container = styled.div`
  display: flex;
  margin-bottom: 10px;
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

    if (!isNilOrError(tenantLocales) && tenantLocales.length > 1) {
      return (
        <Container>
          {tenantLocales.map(locale => (
            <StyledButton
              key={locale}
              onClick={onLocaleChange(locale)}
              type="button"
              className={`${locale === selectedLocale && 'isSelected'} ${this.validatePerLocale(locale) && 'isComplete'}`}
            >
              <Icon name="dot" />
              {locale}
            </StyledButton>
          ))
          }
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
