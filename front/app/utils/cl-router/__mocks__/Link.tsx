import React from 'react';

const Link = ({ to, onlyActiveOnIndex: _onlyActiveOnIndex, ...rest }) => (
  <a {...rest} href={`/en${to}`} />
);

export default Link;
