import React, { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';

type ItemElementProps =
  | DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement> & { href: string },
      HTMLAnchorElement
    >
  | React.JSX.IntrinsicElements['div'];

// The `render` of a collection item (Tab, MenuItem, ListBoxItem) with a disabled reason.
// React Aria sets aria-disabled only on items it disables, and these stay enabled so
// they keep focus. The props are React Aria's own DOM props for the element.
const renderAriaDisabled = (props: ItemElementProps) =>
  'href' in props ? (
    <a {...props} aria-disabled="true" />
  ) : (
    <div {...props} aria-disabled="true" />
  );

export default renderAriaDisabled;
