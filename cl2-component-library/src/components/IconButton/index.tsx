import React, { MouseEvent, KeyboardEvent } from 'react';
import Icon, { IconNames } from '../../components/Icon';
import styled from 'styled-components';
import Box, {
  BoxPositionProps,
  BoxMarginProps,
  BoxPaddingProps,
  BoxVisibilityProps,
  BoxDisplayProps,
  BoxZIndexProps,
} from '../Box';

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
}>`
  cursor: pointer;

  &:hover,
  &:focus {
    ${StyledIcon} {
      fill: ${({ iconColorOnHover }) => iconColorOnHover};
    }
  }
`;

export type IconButtonProps = {
  className?: string;
  iconName: IconNames;
  // Provide a description that describes the button's task
  // E.g. close idea page modal
  a11y_buttonActionMessage: string;
  onClick: (event?: MouseEvent | KeyboardEvent) => void;
  iconWidth?: string;
  iconHeight?: string;
  iconColor: string;
  iconColorOnHover: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  buttonType?: 'submit' | 'button' | 'reset';
  transform?: string;
} & BoxPositionProps &
  BoxMarginProps &
  BoxPaddingProps &
  BoxVisibilityProps &
  BoxDisplayProps &
  BoxZIndexProps;

const IconButton = ({
  className,
  iconName,
  onClick,
  a11y_buttonActionMessage,
  iconWidth = '24px',
  iconHeight = '24px',
  iconColor,
  iconColorOnHover,
  ariaExpanded,
  ariaControls,
  buttonType,
  transform,
  ...rest
}: IconButtonProps) => {
  return (
    <StyledBox
      as="button"
      className={className ?? ''}
      onClick={onClick}
      iconColorOnHover={iconColorOnHover}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      type={buttonType}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="button"
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
