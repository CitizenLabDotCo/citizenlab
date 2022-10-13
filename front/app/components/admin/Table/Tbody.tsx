import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Body = ({ children }: Props) => <tbody>{children}</tbody>;

export default Body;
