import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
};

const IdeaOfficialFeedbackModal = ({ open, onClose }: Props) => {
  return (
    <Modal width="460px" opened={open} close={onClose}>
      <Box
        display="flex"
        height="64px"
        width="64px"
        borderRadius="100%"
        background={colors.errorLight}
      >
        hi
      </Box>
    </Modal>
  );
};

export default IdeaOfficialFeedbackModal;
