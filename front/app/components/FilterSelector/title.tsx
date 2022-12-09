import React, { PureComponent } from 'react';
import { removeFocusAfterMouseClick, isPage } from 'utils/helperUtils';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Text = styled.span<{ textColor?: string }>`
  color: ${({ textColor }) => textColor ?? colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  transition: all 100ms ease-out;
  &::first-letter {
    text-transform: uppercase;
  }
`;

const DropdownIcon = styled(Icon)<{ textColor?: string }>`
  fill: ${({ textColor }) => textColor ?? colors.textPrimary};
  transition: all 100ms ease-out;
`;

const Container = styled.button<{ textColor?: string }>`
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &.adminpage {
    ${Text} {
      color: ${colors.primary};
    }

    ${DropdownIcon} {
      fill: ${colors.primary};
    }
  }

  &:hover,
  &:focus,
  &.opened {
    ${Text} {
      color: ${({ textColor }) => darken(0.2, textColor ?? colors.textPrimary)};
      text-decoration: underline;
    }

    ${DropdownIcon} {
      fill: ${({ textColor }) => darken(0.2, textColor ?? colors.textPrimary)};
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
  handleOnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onClick(event);
  };

  render() {
    const { title, opened, baseID, className, textColor } = this.props;
    const adminPage = isPage('admin', location.pathname);

    return (
      <Container
        onMouseDown={removeFocusAfterMouseClick}
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
          name="chevron-down"
          ariaHidden
          textColor={textColor}
        />
      </Container>
    );
  }
}
