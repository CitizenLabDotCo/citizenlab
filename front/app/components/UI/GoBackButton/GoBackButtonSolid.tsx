import React, { useCallback } from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { ScreenReaderOnly } from 'utils/a11y';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  text: string;
  iconSize?: string;
  onClick?: (event: React.MouseEvent) => void;
  linkTo?: string;
}

const GoBackButtonSolid = ({
  text,
  iconSize = '26px',
  onClick,
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
    <Button
      id="e2e-go-back-link"
      icon="arrow-left-circle"
      buttonStyle="text"
      iconSize={iconSize}
      padding="0"
      textDecorationHover="underline"
      whiteSpace="normal"
      onClick={handleClick}
      linkTo={linkTo}
      text={text}
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
    </Button>
  );
};

export default GoBackButtonSolid;
