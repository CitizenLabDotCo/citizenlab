import React, { MouseEvent, KeyboardEvent } from 'react';

import styled, { css } from 'styled-components';

import Box, {
  BoxPositionProps,
  BoxMarginProps,
  BoxPaddingProps,
  BoxVisibilityProps,
  BoxDisplayProps,
  BoxZIndexProps,
} from '../Box';
import Icon, { IconNames } from '../Icon';

const StyledIcon = styled(Icon)<{
  width: string;
  height: string;
  iconColor: string;
  transform: string | undefined;
}>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  fill: ${({ iconColor }) => iconColor};
  ${({ transform }) => (transform ? `transform: ${transform};` : '')}

  transition: fill 100ms ease-out;
  justify-content: center;
  align-items: center;
`;

const StyledBox = styled(Box)<{
  iconColorOnHover: string;
  disabled?: boolean;
}>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.37 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover,
  &:focus {
    ${({ disabled, iconColorOnHover }) =>
      !disabled &&
      css`
        ${StyledIcon} {
          fill: ${iconColorOnHover};
        }
      `}
  }
`;

export type IconButtonProps = {
  className?: string;
  id?: string;
  iconName: IconNames;
  // Provide a description that describes the button's task
  // E.g. close idea page modal
  a11y_buttonActionMessage: string;
  onClick: (event?: MouseEvent | KeyboardEvent) => void;
  iconWidth?: string;
  iconHeight?: string;
  iconColor: string;
  iconColorOnHover: string;
  ariaHidden?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
  buttonType?: 'submit' | 'button' | 'reset';
  transform?: string;
  opacity?: number;
  iconRef?: React.Ref<any>;
  disabled?: boolean;
} & BoxPositionProps &
  BoxMarginProps &
  BoxPaddingProps &
  BoxVisibilityProps &
  BoxDisplayProps &
  BoxZIndexProps;

const IconButton = ({
  className,
  id,
  iconName,
  onClick,
  a11y_buttonActionMessage,
  iconWidth = '24px',
  iconHeight = '24px',
  iconColor,
  iconColorOnHover,
  ariaHidden,
  ariaExpanded,
  ariaControls,
  buttonType,
  opacity,
  transform,
  iconRef,
  disabled,
  ...rest
}: IconButtonProps) => {
  return (
    <StyledBox
      as="button"
      className={className ?? ''}
      id={id}
      onClick={onClick}
      iconColorOnHover={iconColorOnHover}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-hidden={ariaHidden}
      type={buttonType}
      display="flex"
      alignItems="center"
      justifyContent="center"
      opacity={opacity}
      disabled={disabled}
      role="button"
      ref={iconRef}
      {...rest}
    >
      <StyledIcon
        name={iconName}
        title={a11y_buttonActionMessage}
        ariaHidden={false}
        width={iconWidth}
        height={iconHeight}
        iconColor={iconColor}
        transform={transform}
      />
    </StyledBox>
  );
};

export default IconButton;
