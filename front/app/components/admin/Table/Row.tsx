import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  ref?: React.RefObject<any>;
}

const Row = ({ children, className, ref }: Props) => (
  <tr className={className} ref={ref}>
    {children}
  </tr>
);

export default Row;
