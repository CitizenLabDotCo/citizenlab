import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, Dropdown } from 'cl2-component-library';

// services
import { updateLocale } from 'services/locale';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'containers/App/constants';

// typings
import { Locale } from 'typings';

const DropdownButtonText = styled.div`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  transition: all 100ms ease-out;
`;

const DropdownButtonIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  margin-top: 1px;
  margin-left: 4px;
  transition: all 100ms ease-out;
  ${isRtl`
    margin-left: 0;
    margin-right: 4px;
  `}
`;

const DropdownButton = styled.button`
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  &:hover,
  &:focus {
    ${DropdownButtonText} {
      text-decoration: underline;
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
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;

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
  tenant: GetAppConfigurationChildProps;
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
      dropdownOpened: false,
    };
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  toggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ dropdownOpened }) => ({
      dropdownOpened: !dropdownOpened,
    }));
  };

  handleLanguageSelect = (selectedLocale: Locale) => () => {
    updateLocale(selectedLocale);
    this.setState({ dropdownOpened: false });
  };

  render() {
    const { tenant, locale, className } = this.props;
    const { dropdownOpened } = this.state;

    if (!isNilOrError(tenant) && !isNilOrError(locale)) {
      const tenantLocales = tenant.attributes.settings.core.locales;
      const currentlySelectedLocale = locale;
      const isRtl = !!locale.startsWith('ar');

      return (
        <Container
          className={className}
          onMouseDown={this.removeFocus}
          onClick={this.toggleDropdown}
        >
          <DropdownButton
            className="e2e-langage-dropdown-toggle"
            aria-expanded={dropdownOpened}
          >
            <DropdownButtonText>
              {currentlySelectedLocale.substr(0, 2).toUpperCase()}
            </DropdownButtonText>
            <DropdownButtonIcon name="dropdown" />
          </DropdownButton>

          <Dropdown
            width="180px"
            top="68px"
            right={!isRtl ? '0px' : undefined}
            left={isRtl ? '0px' : undefined}
            mobileRight={!isRtl ? '5px' : undefined}
            mobileLeft={isRtl ? '5px' : undefined}
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            content={
              <>
                {tenantLocales.map((tenantLocale, index) => {
                  const last = index === tenantLocales.length - 1;

                  return (
                    <ListItem
                      key={tenantLocale}
                      onClick={this.handleLanguageSelect(tenantLocale)}
                      className={`e2e-langage-${tenantLocale} ${
                        tenantLocale === currentlySelectedLocale ? 'active' : ''
                      } ${last ? 'last' : ''}`}
                      lang={tenantLocale}
                    >
                      <ListItemText>
                        {shortenedAppLocalePairs[tenantLocale]}
                      </ListItemText>
                    </ListItem>
                  );
                })}
              </>
            }
          />
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps) => <LanguageSelector {...inputProps} {...dataProps} />}
  </Data>
);
