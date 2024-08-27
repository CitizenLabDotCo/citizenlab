import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Icon,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useVerificationMethod from 'api/verification_methods/useVerificationMethod';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getReturnedFieldsPreview } from './utils';

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${colors.teal100};
  }
`;

interface Props {
  number: number;
  // onClick: () => void;
}

const VerificationBlock = ({ number }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: verificationMethod } = useVerificationMethod();

  const verificationMethodMetadata =
    verificationMethod?.data.attributes.action_metadata;

  if (!verificationMethodMetadata) return null;

  const verifiedFieldsMessage = formatMessage(messages.verifiedFields);

  const returnedFieldsPreview = getReturnedFieldsPreview(
    verificationMethodMetadata,
    localize
  );

  return (
    <StyledBox
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.blue700}`}
      bgColor={colors.teal50}
      p="16px"
      w="240px"
      style={{
        cursor: 'pointer',
      }}
      // onClick={onClick}
    >
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        mb="8px"
        alignItems="flex-start"
      >
        <Box>{`${number}.`}</Box>
        <Icon
          name="settings"
          fill={colors.blue500}
          width="16px"
          height="16px"
        />
      </Box>
      <Box>
        {formatMessage(messages.identityVerificationWith, {
          verificationMethod: verificationMethodMetadata.name,
        })}

        <Box mt="12px">
          {verifiedFieldsMessage}
          <br />
          <b>{returnedFieldsPreview}</b>
        </Box>
      </Box>
    </StyledBox>
  );
};

export default VerificationBlock;
