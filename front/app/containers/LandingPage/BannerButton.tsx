import React from 'react';
import Button from 'components/UI/Button';

const BannerButton = ({ buttonStyle, ...props }) => (
  <Button
    buttonStyle={buttonStyle || 'primary-inverse'}
    fontWeight="500"
    padding="13px 22px"
    {...props}
  />
);

export default BannerButton;
