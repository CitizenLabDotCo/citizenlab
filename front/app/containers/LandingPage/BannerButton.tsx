import React, { MouseEvent, KeyboardEvent } from 'react';
import Button from 'components/UI/Button';

type Props = {
  className?: string;
  buttonStyle: 'primary-inverse' | 'primary';
  text: string;
  linkTo?: string;
  onClick?: (event: MouseEvent | KeyboardEvent) => void;
  openLinkInNewTab?: boolean;
};

const BannerButton = ({ buttonStyle, ...props }: Props) => (
  <Button
    buttonStyle={buttonStyle || 'primary-inverse'}
    fontWeight="500"
    padding="13px 22px"
    {...props}
  />
);

export default BannerButton;
