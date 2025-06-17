import React from 'react';

import { Box, Image, Title, Text } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import stepMessages from '../messages';

import messages from './messages';
import SuccessImageSrc from './SuccessImage.svg';

interface Props {
  loading: boolean;
  onContinue: () => void;
}

const Success = ({ loading, onContinue }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      id="e2e-sign-up-success-modal"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Image src={SuccessImageSrc} alt="" />
      <Title variant="h4" as="h2" mt="24px" mb="0">
        {formatMessage(messages.allDone)}
      </Title>
      <Text mt="8px" mb="24px" color="tenantText">
        {formatMessage(messages.nowContinueYourParticipation)}
      </Text>
      <ButtonWithLink
        id="e2e-success-continue-button"
        mb="0"
        width="auto"
        disabled={loading}
        processing={loading}
        onClick={onContinue}
      >
        {formatMessage(stepMessages.continue)}
      </ButtonWithLink>
    </Box>
  );
};

export default Success;
