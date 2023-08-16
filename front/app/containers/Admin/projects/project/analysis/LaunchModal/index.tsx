import { Button } from '@citizenlab/cl2-component-library';
import React from 'react';

type LaunchModalProps = {
  onClose: () => void;
};
const LaunchModal = ({ onClose }: LaunchModalProps) => {
  return (
    <div>
      <h1>Launch Modal</h1>
      <Button onClick={onClose}>I understand</Button>
    </div>
  );
};

export default LaunchModal;
