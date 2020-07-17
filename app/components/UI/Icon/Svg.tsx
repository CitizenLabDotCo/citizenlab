import React from 'react';

interface Props {
  className?: string;
  children: JSX.Element | JSX.Element[];
  name: string;
  // if ariaHidden is not specified (or false), a title is 'required' (for a11y)
  title?: string | JSX.Element;
  viewBox?: string;
  fill?: string;
  ariaHidden?: boolean;
  height?: string;
  width?: string;
}

const Svg = React.memo(
  ({
    className,
    children,
    name,
    title,
    viewBox,
    fill,
    ariaHidden,
    height,
    width,
  }: Props) => {
    /*
    When we have multiple icons of the same type on a page,
    we need unique identifiers. On the profile page, there
    were two close icons and the screen reader was confused
    about their titles.
  */
    const randomNum = Math.round(Math.random() * 100);
    const titleId = `${name}-${randomNum}`;

    return (
      <svg
        className={className || ''}
        role="img"
        aria-labelledby={titleId}
        viewBox={viewBox}
        aria-hidden={ariaHidden || false}
        fill={fill || 'none'}
        xmlns="http://www.w3.org/2000/svg"
        height={height || '100%'}
        width={width}
      >
        {title && <title id={titleId}>{title}</title>}
        {children}
      </svg>
    );
  }
);

export default Svg;
