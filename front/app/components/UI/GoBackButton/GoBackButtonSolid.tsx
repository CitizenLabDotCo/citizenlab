import React, { useCallback } from 'react';

// components
import { Button } from '@citizenlab/cl2-component-library';
import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  text: string;
  iconSize?: string;
  onClick: (event: React.MouseEvent) => void;
}

const GoBackButtonSolid = ({ iconSize = '26px', onClick }: Props) => {
  const { formatMessage } = useIntl();
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onClick(event);
    },
    [onClick]
  );

  return (
    <Button
      id="e2e-idea-other-link"
      icon="arrow-left-circle"
      buttonStyle="text"
      iconSize={iconSize}
      padding="0"
      textDecorationHover="underline"
      whiteSpace="normal"
      onClick={handleClick}
    >
      <ScreenReaderOnly>
        {formatMessage(messages.goBackToPreviousPage)}
      </ScreenReaderOnly>
    </Button>
  );
};

export default GoBackButtonSolid;
