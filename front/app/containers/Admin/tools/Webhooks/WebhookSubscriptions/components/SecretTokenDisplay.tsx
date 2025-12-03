import React, { useState } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

const StyledSecretText = styled(Text)`
  word-break: break-all;
`;

type SecretTokenDisplayProps = {
  secret: string;
  onClose: () => void;
};

const SecretTokenDisplay = ({ secret, onClose }: SecretTokenDisplayProps) => {
  const [secretIsCopied, setSecretIsCopied] = useState(false);
  const { formatMessage } = useIntl();

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setSecretIsCopied(true);
  };

  return (
    <>
      <Text>
        <FormattedMessage
          {...messages.createSuccessDescription}
          values={{
            webhookDocumentationLink: (
              <a
                href={formatMessage(messages.documentationUrl)}
                target="_blank"
                rel="noreferrer"
              >
                {formatMessage(messages.webhookDocumentationLink)}
              </a>
            ),
          }}
        />
      </Text>
      <Box mb="20px">
        <Warning>
          <FormattedMessage
            {...messages.createSuccessImportant}
            values={{
              secret: <span>{formatMessage(messages.secretToken)}</span>,
              b: (chunks) => (
                <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
              ),
            }}
          />
        </Warning>
      </Box>
      <Box bgColor={colors.tealLight} py="4px" px="12px">
        <StyledSecretText fontWeight="bold" textAlign="center">
          {secret}
        </StyledSecretText>
      </Box>
      <Box display="flex" gap="12px" justifyContent="flex-end" mt="40px">
        <Button buttonStyle="secondary-outlined" onClick={onClose}>
          {formatMessage(messages.close)}
        </Button>
        <Button
          buttonStyle="primary"
          onClick={copySecret}
          icon={secretIsCopied ? 'check' : 'copy'}
        >
          {secretIsCopied
            ? formatMessage(messages.copiedSuccess)
            : formatMessage(messages.copySecret)}
        </Button>
      </Box>
    </>
  );
};

export default SecretTokenDisplay;
