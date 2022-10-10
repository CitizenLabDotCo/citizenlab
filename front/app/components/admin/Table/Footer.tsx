import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Footer = ({ children }: Props) => <tfoot>{children}</tfoot>;

export default Footer;
