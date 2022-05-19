import React from 'react';

const Link = ({ to, ...rest }) => <a {...rest} href={`/en${to}`} />;

export default Link;
