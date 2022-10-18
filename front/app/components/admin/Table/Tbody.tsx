import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Tbody = ({ children }: Props) => <tbody>{children}</tbody>;

export default Tbody;
