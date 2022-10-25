import React, { MouseEvent, KeyboardEvent } from 'react';
import Button from 'components/UI/Button';

export type BannerButtonStyle = 'primary-inverse' | 'primary';

type Props = {
  className?: string;
  buttonStyle: BannerButtonStyle;
  text: string;
  linkTo?: string | null;
  onClick?: (event: MouseEvent | KeyboardEvent) => void;
  openLinkInNewTab?: boolean;
};

const BannerButton = ({ buttonStyle, ...props }: Props) => (
  <Button
    buttonStyle={buttonStyle || 'primary-inverse'}
    fontWeight="500"
    padding="13px 22px"
    data-cy="e2e-cta-banner-button"
    className="intercom-cta-banner-button"
    {...props}
  />
);

export default BannerButton;
