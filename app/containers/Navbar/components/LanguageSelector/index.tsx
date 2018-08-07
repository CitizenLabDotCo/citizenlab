import React from 'react';

// components
import Popover from 'components/Popover';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// services
import { updateLocale } from 'services/locale';

// style
import styled from 'styled-components';
import { colors, fontSize } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'i18n';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  display: flex;
  position: relative;
  cursor: pointer;
  outline: none;
  margin: 0;
  padding: 0;

  * {
    user-select: none;
  }
`;

const StyledPopover = styled(Popover)`
  display: flex;
  flex-direction: column;
  z-index: 5;
  top: 35px;
`;

const DropdownItemIcon = styled(Icon)`
  height: 6px;
  width: 11px;
  fill: inherit;
  margin-top: 1px;
  margin-left: 4px;
  transition: all 100ms ease-out;
`;

const OpenMenuButton = styled.button`
  color: ${colors.clGrey};
  font-size: 17px;
  font-weight: 400;
  line-height: 17px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;

  &:hover,
  &:focus {
    color: ${colors.clGreyHover};
  }
`;

const PopoverItem = styled(Button)`
  color: ${colors.clGrey};
  fill: ${colors.clGrey};
  font-weight: 400;
  transition: all 100ms ease-out;

  &.active button.Button,
  &.active a.Button {
    color: ${colors.clGreyHover};
    font-weight: 700;
  }

  .buttonText {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  a.Button,
  button.Button {
    background: #fff;
    border-radius: 5px;
    padding: 10px;

    &:hover,
    &:focus {
      color: ${colors.clGreyHover};
      background: ${colors.clDropdownHoverBackground};
      fill: ${colors.clGreyHover};
    }
  }
`;

type Props = {
  currentLocale: Locale;
  localeOptions: Locale[];
};

type State = {
  PopoverOpened: boolean;
};

export default class LanguageSelector extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      PopoverOpened: false
    };
  }

  togglePopover = () => {
    this.setState(state => ({ PopoverOpened: !state.PopoverOpened }));
  }

  closePopover = () => {
    this.setState({ PopoverOpened: false });
  }

  handleLanguageSelect = (newLocale) => () => {
    updateLocale(newLocale);
    this.closePopover();
  }

  render() {
    const { PopoverOpened } = this.state;
    const { localeOptions, currentLocale } = this.props;
    return (
      <Container>
        <OpenMenuButton onClick={this.togglePopover}>
          {currentLocale.substr(0, 2).toUpperCase()}
          <DropdownItemIcon name="dropdown" />
        </OpenMenuButton>
        <StyledPopover
          open={PopoverOpened}
          onCloseRequest={this.closePopover}
        >
        {
          localeOptions.map(locale => (
            <PopoverItem
              size="1"
              key={locale}
              style="text"
              onClick={this.handleLanguageSelect(locale)}
              className={locale === currentLocale ? 'active' : ''}
            >
              {shortenedAppLocalePairs[locale]}
            </PopoverItem>
          ))
        }
        </StyledPopover>
      </Container>
    );
  }
}
