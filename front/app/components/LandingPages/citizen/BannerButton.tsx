import React, { MouseEvent, KeyboardEvent } from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { type TypedLinkProps } from 'utils/cl-router/Link';

export type BannerButtonStyle = 'primary-inverse' | 'primary';

type Props = {
  className?: string;
  buttonStyle: BannerButtonStyle;
  text: string;
  linkTo?: string | null;
  onClick?: (event: MouseEvent | KeyboardEvent) => void;
  openLinkInNewTab?: boolean;
} & TypedLinkProps;

const BannerButton = ({ buttonStyle, ...props }: Props) => (
  <ButtonWithLink
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    buttonStyle={buttonStyle || 'primary-inverse'}
    fontWeight="500"
    padding="13px 22px"
    data-cy="e2e-cta-banner-button"
    className="intercom-cta-banner-button"
    {...props}
  />
);

export default BannerButton;
