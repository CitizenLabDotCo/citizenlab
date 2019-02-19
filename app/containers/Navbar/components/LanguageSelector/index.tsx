import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Dropdown from 'components/UI/Dropdown';
import Icon from 'components/UI/Icon';

// services
import { updateLocale } from 'services/locale';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'containers/App/constants';

// typings
import { Locale } from 'typings';

const DropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: ${colors.label};
  margin-top: 1px;
  margin-left: 4px;
  transition: all 80ms ease-out;
`;

const OpenMenuButton = styled.button`
  color: ${(props: any) => props.theme.colorText};
  border-radius: 5px;
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  outline: none;
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  * {
    user-select: none;
  }

  &:hover,
  &:focus {
    ${OpenMenuButton} {
      color: #000;

      ${DropdownItemIcon} {
        fill: #000;
      }
    }
  }
`;

const ListItemText = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

const ListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  transition: all 80ms ease-out;
  &.last {
    margin-bottom: 0px;
  }
  &:hover,
  &:focus,
  &.active {
    background: ${colors.clDropdownHoverBackground};
    ${ListItemText} {
      color: #000;
    }
  }
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends DataProps, InputProps {}

type State = {
  dropdownOpened: boolean;
};

class LanguageSelector extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false
    };
  }

  toggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ dropdownOpened }) => ({ dropdownOpened: !dropdownOpened }));
  }

  handleLanguageSelect = (selectedLocale: Locale) => () => {
    updateLocale(selectedLocale);

    this.setState({ dropdownOpened: false });
  }

  render() {
    const { tenant, locale, className } = this.props;
    const { dropdownOpened } = this.state;

    if (!isNilOrError(tenant) && !isNilOrError(locale)) {
      const tenantLocales = tenant.attributes.settings.core.locales;
      const currentlySelectedLocale = locale;

      return (
        <Container className={className} onClick={this.toggleDropdown}>
          <OpenMenuButton className="e2e-langage-dropdown-toggle">
            {currentlySelectedLocale.substr(0, 2).toUpperCase()}
            <DropdownItemIcon name="dropdown" />
          </OpenMenuButton>

          <Dropdown
            width="180px"
            top="68px"
            right="-5px"
            mobileRight="-5px"
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            content={(
              <>
                {tenantLocales.map((tenantLocale, index) => {
                  const last = (index === tenantLocales.length - 1);

                  return (
                    <ListItem
                      key={tenantLocale}
                      onClick={this.handleLanguageSelect(tenantLocale)}
                      className={`e2e-langage-${tenantLocale} ${tenantLocale === currentlySelectedLocale ? 'active' : ''} ${last ? 'last' : ''}`}
                    >
                      <ListItemText>{shortenedAppLocalePairs[tenantLocale]}</ListItemText>
                    </ListItem>
                  );
                })}
              </>
            )}
          />
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
  locale: <GetLocale />
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <LanguageSelector {...inputProps} {...dataProps} />}
  </Data>
);
