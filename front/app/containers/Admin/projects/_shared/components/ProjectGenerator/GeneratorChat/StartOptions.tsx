import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  onStartFromScratch: () => void;
  onStartFromTemplate: () => void;
};

// The other ways to create a project, for admins who would rather not chat.
const StartOptions = ({ onStartFromScratch, onStartFromTemplate }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" alignItems="center" gap="24px">
      <ButtonWithLink
        type="button"
        buttonStyle="bo-text"
        boSize="medium"
        padding="0"
        textColor={colors.primary}
        onClick={onStartFromScratch}
      >
        {formatMessage(messages.startFromScratch)}
      </ButtonWithLink>
      <ButtonWithLink
        type="button"
        buttonStyle="bo-text"
        boSize="medium"
        padding="0"
        onClick={onStartFromTemplate}
      >
        {formatMessage(messages.startFromTemplate)}
      </ButtonWithLink>
    </Box>
  );
};

export default StartOptions;
