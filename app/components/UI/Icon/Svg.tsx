import React from 'react';
import { IconNames } from '.';

interface Props {
  className?: string;
  children: JSX.Element | JSX.Element[];
  name: IconNames;
  // if ariaHidden is not specified, a title is 'required' (for a11y)
  title?: string | JSX.Element;
  viewBox?: string;
  fill?: string;
  ariaHidden?: boolean;
  height?: string;
  width?: string;
}

const Svg = React.memo(({ className, children, name, title, viewBox, fill, ariaHidden, height, width }: Props) => {
  return (
    <svg
      className={className}
      role="img"
      aria-labelledby={name}
      viewBox={viewBox}
      aria-hidden={ariaHidden || false}
      fill={fill || 'none'}
      xmlns="http://www.w3.org/2000/svg"
      height={height || '100%'}
      width={width || '100%'}
    >
      {title && <title id={name}>{title}</title>}
      {children}
    </svg>
  );
});

export default Svg;
