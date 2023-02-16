import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import Modal from './Modal';
import Centerer from 'components/UI/Centerer';

const NewSignUpModal = () => {
  return (
    <Box w="100%" h="100%">
      <Centerer h="500px">
        <Modal />
      </Centerer>
    </Box>
  );
};

export default NewSignUpModal;
