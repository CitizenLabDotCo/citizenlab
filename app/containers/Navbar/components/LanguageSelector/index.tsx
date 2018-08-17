import React from 'react';

// components
import Dropdown from 'components/UI/Dropdown';
import Icon from 'components/UI/Icon';

// services
import { updateLocale } from 'services/locale';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'i18n';

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
  font-size: 17px;
  font-weight: 400;
  line-height: 17px;
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
  font-size: 17px;
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

type Props = {
  currentLocale: Locale;
  localeOptions: Locale[];
};

type State = {
  dropdownOpened: boolean;
};

export default class LanguageSelector extends React.PureComponent<Props, State> {
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

  handleLanguageSelect = (newLocale: Locale) => () => {
    updateLocale(newLocale);
    this.setState({ dropdownOpened: false });
  }

  render() {
    const { dropdownOpened } = this.state;
    const { localeOptions, currentLocale } = this.props;

    return (
      <Container>
        <OpenMenuButton onClick={this.toggleDropdown}>
          {currentLocale.substr(0, 2).toUpperCase()}
          <DropdownItemIcon name="dropdown" />
        </OpenMenuButton>

        <Dropdown
          width="180px"
          top="35px"
          right="-10px"
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
}
