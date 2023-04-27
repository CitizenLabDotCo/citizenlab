import React from 'react';
import SuccessImageSrc from './SuccessImage.svg';

// components
import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import stepMessages from '../messages';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Status } from '../../typings';

interface Props {
  status: Status;
  onContinue: () => void;
}

const Success = ({ status, onContinue }: Props) => {
  const { formatMessage } = useIntl();
  const loading = status === 'pending';

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Image src={SuccessImageSrc} alt="" />
      <Title variant="h4" as="h2" mt="24px" mb="0">
        {formatMessage(messages.allDone)}
      </Title>
      <Text mt="8px" mb="24px">
        {formatMessage(messages.nowContinueYourParticipation)}
      </Text>
      <Button
        id="e2e-success-continue-button"
        mb="0"
        width="auto"
        disabled={loading}
        processing={loading}
        onClick={onContinue}
      >
        {formatMessage(stepMessages.continue)}
      </Button>
    </Box>
  );
};

export default Success;
