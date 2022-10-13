import React from 'react';

export interface Props {
  children: React.ReactNode;
  className?: string;
}

const Row = React.forwardRef(
  (
    { children, className }: Props,
    ref: React.RefObject<HTMLTableRowElement>
  ) => (
    <tr className={className} ref={ref}>
      {children}
    </tr>
  )
);

export default Row;
