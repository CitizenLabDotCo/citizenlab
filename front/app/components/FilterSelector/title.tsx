import React, { PureComponent } from 'react';

// components
import { Icon } from 'cl2-component-library';

// utils
import { isPage } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Text = styled.span<{ textColor?: string }>`
  color: ${({ textColor }) => textColor ?? colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  transition: all 100ms ease-out;
  &::first-letter {
    text-transform: uppercase;
  }
`;

const DropdownIcon = styled(Icon)<{ textColor?: string }>`
  width: 10px;
  height: 7px;
  fill: ${({ textColor }) => textColor ?? colors.text};
  transition: all 100ms ease-out;
  margin-left: 7px;
`;

const Container = styled.button<{ textColor?: string }>`
  height: 24px;
  cursor: pointer;

  &.adminpage {
    ${Text} {
      color: ${colors.adminTextColor};
    }

    ${DropdownIcon} {
      fill: ${colors.adminTextColor};
    }
  }

  &:hover,
  &:focus,
  &.opened {
    ${Text} {
      color: ${({ textColor }) => darken(0.2, textColor ?? colors.text)};
      text-decoration: underline;
    }

    ${DropdownIcon} {
      fill: ${({ textColor }) => darken(0.2, textColor ?? colors.text)};
    }
  }
`;

interface Props {
  title: string | JSX.Element;
  opened: boolean;
  onClick: (arg: React.MouseEvent<HTMLButtonElement>) => void;
  baseID: string;
  className?: string;
  textColor?: string;
}

interface State {}

export default class Title extends PureComponent<Props, State> {
  removeFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onClick(event);
  };

  render() {
    const { title, opened, baseID, className, textColor } = this.props;
    const adminPage = isPage('admin', location.pathname);

    return (
      <Container
        onMouseDown={this.removeFocus}
        onClick={this.handleOnClick}
        aria-expanded={opened}
        id={`${baseID}-label`}
        className={`e2e-filter-selector-button FilterSelectorTitle ${
          opened ? 'opened' : ''
        } ${className} ${adminPage ? 'adminpage' : ''}`}
        aria-live="polite"
        textColor={textColor}
      >
        <Text className="FilterSelectorTitleText" textColor={textColor}>
          {title}
        </Text>
        <DropdownIcon
          className="FilterSelectorTitleIcon"
          name="dropdown"
          ariaHidden
          textColor={textColor}
        />
      </Container>
    );
  }
}
