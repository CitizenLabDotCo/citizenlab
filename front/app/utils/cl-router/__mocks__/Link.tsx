import React from 'react';

const Link = ({ to, ...rest }) => <a {...rest} href={to} />;

export default Link;
