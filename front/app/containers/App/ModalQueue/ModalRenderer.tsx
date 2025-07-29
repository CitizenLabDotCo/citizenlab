import React from 'react';

import modalRegistry, { ModalId } from './modals/modalRegistry';

const ModalRenderer = ({ modalId }: { modalId: ModalId | null }) => {
  if (!modalId) return null;

  const ModalComponent = modalRegistry[modalId].component;

  return <ModalComponent />;
};

export default ModalRenderer;
