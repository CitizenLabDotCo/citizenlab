import React, { MouseEvent, KeyboardEvent } from 'react';
import Button from 'components/UI/Button';

export type BannerButtonStyle = 'primary-inverse' | 'primary';

type Props = {
  className?: string;
  buttonStyle: BannerButtonStyle;
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
