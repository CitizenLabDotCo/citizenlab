import React, { useState } from 'react';

import {
  Box,
  InputContainer,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  submissionId: string;
}

const SubmissionIdContainer = ({ submissionId }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionId);
    setCopied(true);
  };

  return (
    <Box
      h="40px"
      display="flex"
      justifyContent="flex-start"
      alignItems="center"
    >
      <InputContainer onClick={handleCopy}>
        <Text mr="8px" fontSize="s" my="0" mt="1px">
          {submissionId}
        </Text>
        <Icon
          name={copied ? 'check' : 'copy'}
          height="18px"
          stroke={copied ? colors.green500 : undefined}
        />
      </InputContainer>
    </Box>
  );
};

export default SubmissionIdContainer;
