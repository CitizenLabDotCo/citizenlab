import React, { KeyboardEvent } from 'react';

import { Icon, fontSizes, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import { removeFocusAfterMouseClick, isPage } from 'utils/helperUtils';

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
  handleKeyDown?: (event: KeyboardEvent) => void;
}

const Title = ({
  title,
  opened,
  onClick,
  baseID,
  className,
  textColor,
  handleKeyDown,
}: Props) => {
  const adminPage = isPage('admin', location.pathname);

  return (
    <Container
      onMouseDown={removeFocusAfterMouseClick}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      aria-expanded={opened}
      aria-controls={baseID}
      aria-live="polite"
      id={`${baseID}-label`}
      className={`e2e-filter-selector-button FilterSelectorTitle ${
        opened ? 'opened' : ''
      } ${className} ${adminPage ? 'adminpage' : ''}`}
      textColor={textColor}
    >
      <Text className="FilterSelectorTitleText" textColor={textColor}>
        {title}
      </Text>
      <DropdownIcon
        className="FilterSelectorTitleIcon"
        name={opened ? 'chevron-up' : 'chevron-down'}
        ariaHidden
        textColor={textColor}
      />
    </Container>
  );
};

export default Title;
