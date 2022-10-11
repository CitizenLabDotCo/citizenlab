import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Row = ({ children, className }: Props) => (
  <tr className={className}>{children}</tr>
);

export default Row;
