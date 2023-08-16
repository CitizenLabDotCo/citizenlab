import {
  Button,
  Title,
  Box,
  Icon,
  colors,
  Text,
} from '@citizenlab/cl2-component-library';
import React from 'react';

type LaunchModalProps = {
  onClose: () => void;
};
const LaunchModal = ({ onClose }: LaunchModalProps) => {
  return (
    <Box px="20px" display="flex" flexDirection="column" gap="16px">
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" fill={colors.orange} width="40px" height="40px" />
        <Title>Limitations</Title>
      </Box>
      <Box>
        <Text>
          We heavily recommend not to take AI generated summaries at face value
          and look at the data.
        </Text>
        <Text>
          <b>Hallucinations:</b> the AI might make up non existing ideas
        </Text>
        <Text>
          <b>Exaggeration:</b> the AI might give excessive importance to one
          idea
        </Text>
      </Box>
      <Button onClick={onClose}>I understand</Button>
    </Box>
  );
};

export default LaunchModal;
