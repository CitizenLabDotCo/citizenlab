import React from 'react';
import Box, {
  BoxPositionProps,
  BoxMarginProps,
  BoxPaddingProps,
  BoxVisibilityProps,
  BoxDisplayProps,
  BoxZIndexProps,
} from '../Box';

import styled from 'styled-components';

export type SvgProps = {
  className?: string;
  children?: JSX.Element | JSX.Element[];
  name: string;
  // if ariaHidden is not specified (or false), a title is 'required' (for a11y)
  title?: string | JSX.Element;
  viewBox?: string;
  fill?: string;
  ariaHidden?: boolean;
  height?: string;
  width?: string;
  transform?: string;
} & BoxPositionProps &
  BoxMarginProps &
  BoxPaddingProps &
  BoxVisibilityProps &
  BoxDisplayProps &
  BoxZIndexProps;

const StyledBox = styled(Box)<{ fill?: string; transform?: string }>`
  fill: ${({ fill }) => fill};
  ${({ transform }) => transform && `transform: ${transform};`}
`;

const Svg = ({
  className,
  children,
  title,
  viewBox,
  fill = '#000',
  ariaHidden = true,
  height = '24px',
  width = '24px',
  transform,
  ...rest
}: SvgProps) => {
  return (
    <StyledBox
      as="svg"
      className={className || ''}
      role="img"
      viewBox={viewBox}
      aria-hidden={ariaHidden}
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      fill={fill}
      transform={transform}
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </StyledBox>
  );
};

export default Svg;
