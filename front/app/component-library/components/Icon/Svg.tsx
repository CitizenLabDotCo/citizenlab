import React, { useMemo } from 'react';

import styled from 'styled-components';

import Box, {
  BoxPositionProps,
  BoxMarginProps,
  BoxPaddingProps,
  BoxVisibilityProps,
  BoxDisplayProps,
  BoxZIndexProps,
} from '../Box';

export type SvgProps = {
  className?: string;
  children?: JSX.Element | JSX.Element[];
  name: string;
  // if ariaHidden is not specified (or false), a title is 'required' (for a11y)
  title?: string | JSX.Element;
  viewBox?: string;
  fill?: string;
  stroke?: string;
  ariaHidden?: boolean;
  height?: string;
  width?: string;
  transform?: string;
  role?: string;
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
  name,
  role = 'img',
  ...rest
}: SvgProps) => {
  // Generate a unique id for the title element to ensure it doesn't conflict
  // with other instances of the same icon on the same page.
  // useMemo is used to ensure the id is calculated only once when the component is mounted
  // and remains stable unless the name prop changes.
  const titleId = useMemo(
    () => `icon-${name}-${Math.random().toString(36).slice(2, 11)}`,
    [name]
  );

  return (
    <StyledBox
      as="svg"
      className={className || ''}
      role={role}
      viewBox={viewBox}
      aria-hidden={ariaHidden}
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
      fill={fill}
      transform={transform}
      // https://www.tpgi.com/using-aria-enhance-svg-accessibility/
      {...(title ? { 'aria-labelledby': titleId } : {})}
      {...rest}
    >
      {title && <title id={titleId}>{title}</title>}
      {children}
    </StyledBox>
  );
};

export default Svg;
