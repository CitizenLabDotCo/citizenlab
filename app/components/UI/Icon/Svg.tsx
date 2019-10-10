import React from 'react';

interface Props {
  className?: string;
  children: JSX.Element[];
  name: IconNames;
  // if ariaHidden is not specified, a title is 'required' (for a11y)
  title?: string | JSX.Element;
  viewBox: string;
  fill: string;
  ariaHidden?: boolean;
}

const Svg = React.memo(({ className, children, name, title, viewBox, fill, ariaHidden }: Props) => {
  return (
    <svg
      className={className}
      role="img"
      aria-labelledby={name}
      viewBox={viewBox}
      aria-hidden={ariaHidden}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title id={name}>{title}</title>}
      {children}
    </svg>
  );
});

export default Svg;
