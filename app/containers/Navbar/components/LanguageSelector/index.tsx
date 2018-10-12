import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Dropdown from 'components/UI/Dropdown';
import Icon from 'components/UI/Icon';

// services
import { updateLocale } from 'services/locale';
import { updateUser } from 'services/users';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'containers/App/constants';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  position: relative;
  cursor: pointer;

  * {
    user-select: none;
  }
`;

const DropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: ${colors.label};
  margin-top: 1px;
  margin-left: 4px;
  transition: all 80ms ease-out;
`;

const OpenMenuButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: ${fontSizes.base}px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  outline: none;

  &:hover,
  &:focus {
    color: #000;

    ${DropdownItemIcon} {
      fill: #000;
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

interface DataProps {
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends DataProps {}

type State = {
  dropdownOpened: boolean;
};

class LanguageSelector extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      dropdownOpened: false
    };
  }

  toggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ dropdownOpened }) => ({ dropdownOpened: !dropdownOpened }));
  }

  handleLanguageSelect = (locale: Locale) => () => {
    const { authUser: user } = this.props;

    if (!isNilOrError(user)) {
      updateUser(user.id, { locale }).then((user) => {
        updateLocale(user.data.attributes.locale);
      });
    }

    this.setState({ dropdownOpened: false });
  }

  render() {
    const { dropdownOpened } = this.state;

    if (!isNilOrError(this.props.tenant) && !isNilOrError(this.props.authUser)) {
      const localeOptions = this.props.tenant.attributes.settings.core.locales;
      const currentLocale = this.props.authUser.attributes.locale;

      return (
        <Container>
          <OpenMenuButton onClick={this.toggleDropdown}>
            {currentLocale.substr(0, 2).toUpperCase()}
            <DropdownItemIcon name="dropdown" />
          </OpenMenuButton>

          <Dropdown
            width="180px"
            top="36px"
            right="-5px"
            mobileRight="-5px"
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            content={(
              <>
                {localeOptions.map((locale, index) => {
                  const last = (index === localeOptions.length - 1);

                  return (
                    <ListItem
                      key={locale}
                      onClick={this.handleLanguageSelect(locale)}
                      className={`${locale === currentLocale ? 'active' : ''} ${last ? 'last' : ''}`}
                    >
                      <ListItemText>{shortenedAppLocalePairs[locale]}</ListItemText>
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

const Data = adopt<DataProps>({
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
});

export default () => (
  <Data>
    {dataProps => <LanguageSelector {...dataProps} />}
  </Data>
);
