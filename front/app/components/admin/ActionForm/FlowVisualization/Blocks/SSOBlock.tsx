import React, { useState } from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Icon,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SSOConfigModal from './SSOConfigModal';
import {
  getVerificationFrequencyExplanation,
  getReturnedFieldsPreview,
} from './utils';

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.teal100};
  }
  cursor: pointer;
  text-align: left;
`;

interface Props {
  verificationExpiry: number | null;
  onChangeVerificationExpiry: (value: number | null) => void;
}

const SSOBlock = ({
  verificationExpiry,
  onChangeVerificationExpiry,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();
  const [modalOpen, setModalOpen] = useState(false);

  const verificationMethodMetadata =
    verificationMethod?.data.attributes.method_metadata;

  if (!verificationMethodMetadata) return null;

  const authenticateMessage = formatMessage(
    messages.authenticateWithVerificationProvider,
    {
      verificationMethod: verificationMethodMetadata.name,
    }
  );

  const verifiedFieldsMessage = formatMessage(messages.verifiedFields);

  const verificationFrequencyExplanation = getVerificationFrequencyExplanation(
    verificationExpiry,
    formatMessage
  );

  const returnedFieldsPreview = getReturnedFieldsPreview(
    verificationMethodMetadata,
    localize
  );

  return (
    <>
      <StyledBox
        borderRadius={stylingConsts.borderRadius}
        border={`1px solid ${colors.blue700}`}
        bgColor={colors.teal50}
        p="16px"
        w="240px"
        as="button"
        onClick={(e) => {
          e.preventDefault();
          setModalOpen(true);
        }}
      >
        <Box
          display="flex"
          w="100%"
          justifyContent="space-between"
          mb="8px"
          alignItems="flex-start"
        >
          <Box>{'1.'}</Box>
          <Icon
            name="settings"
            fill={colors.blue500}
            width="16px"
            height="16px"
          />
        </Box>
        <Box>
          {authenticateMessage}
          <br />
          {verificationFrequencyExplanation && (
            <>
              <Text fontSize="xs" mt="8px" color="primary">
                {verificationFrequencyExplanation}
              </Text>
            </>
          )}
          {returnedFieldsPreview && (
            <Box mt="12px">
              {verifiedFieldsMessage}
              <br />
              <b>{returnedFieldsPreview}</b>
            </Box>
          )}
        </Box>
      </StyledBox>
      <SSOConfigModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        verificationExpiry={verificationExpiry}
        onChangeVerificationExpiry={onChangeVerificationExpiry}
      />
    </>
  );
};

export default SSOBlock;
