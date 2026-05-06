import React, { useCallback } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

interface Props extends TypedLinkProps {
  text?: string;
  iconSize?: string;
  onClick?: (event: React.MouseEvent) => void;
  linkTo?: string;
}

const GoBackButtonSolid = ({
  text,
  iconSize = '28px',
  onClick,
  to,
  params,
  search,
  linkTo,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onClick?.(event);
    },
    [onClick]
  );

  return (
    <ButtonWithLink
      id="e2e-go-back-link"
      icon="arrow-left-circle"
      buttonStyle="text"
      iconSize={iconSize}
      padding="0"
      textDecorationHover="underline"
      whiteSpace="normal"
      onClick={handleClick}
      to={to}
      params={params}
      search={search}
      linkTo={linkTo}
    >
      <Box
        as="span"
        display={isSmallerThanPhone ? 'none' : 'block'}
        aria-hidden
      >
        {text}
      </Box>
      <ScreenReaderOnly>
        {formatMessage(messages.goBackToPreviousPage)}
      </ScreenReaderOnly>
    </ButtonWithLink>
  );
};

export default GoBackButtonSolid;
